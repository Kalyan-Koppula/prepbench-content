---
title: AOP, Proxies and @Transactional
order: 3
summary: JDK vs CGLIB proxies, what @Transactional really does, propagation and isolation, rollback rules, the self-invocation trap, @Async and @Cacheable, and writing one aspect.
---

Every Spring annotation that "does something around your method" — `@Transactional`, `@Async`, `@Cacheable`, `@PreAuthorize`, `@Retryable` — works the same way: the container gives other beans a **proxy** instead of your object, and the proxy runs the extra behaviour before and after delegating. Once you understand the proxy, the famous gotchas (self-invocation, private methods, checked exceptions not rolling back) are all obvious. Interviewers know this and ask accordingly.

## Proxies

| | JDK dynamic proxy | CGLIB proxy |
|---|---|---|
| Mechanism | `java.lang.reflect.Proxy` implementing the bean's **interfaces** | runtime-generated **subclass** of the bean's class |
| Requires | the bean implements an interface; injection points must use the interface type | non-final class, non-final methods, a reachable constructor |
| Boot default | no | yes (`spring.aop.proxy-target-class=true`) |
| Can't intercept | anything not on the interface | `final`, `private`, `static` methods |

Because Boot uses CGLIB, you can inject the concrete class type. But `final` methods are silently not advised, and `private` methods can never be intercepted by either mechanism.

```text
caller ──▶ OrderService$$SpringCGLIB (proxy) ──▶ TransactionInterceptor ──▶ OrderService.place() (your code)
```

Inside `place()`, `this` is the **real** object, not the proxy. Hold onto that.

## What `@Transactional` does

```java
@Service
public class TransferService {
    @Transactional
    public void transfer(long from, long to, Money amount) {
        accounts.debit(from, amount);
        accounts.credit(to, amount);      // if this throws, the debit is rolled back
    }
}
```

Needs `spring-tx` (any Data starter brings it) and `@EnableTransactionManagement`, which Boot applies for you. On a call through the proxy, `TransactionInterceptor`:

1. Asks the `PlatformTransactionManager` (JPA's or `DataSourceTransactionManager`) for a transaction per the propagation rule.
2. Binds a connection/`EntityManager` to the **current thread** (`TransactionSynchronizationManager`), so repositories called within the method reuse it.
3. Invokes your method.
4. Commits on normal return; rolls back if an exception matching the rollback rules propagates; then unbinds.

Consequences: the transaction is tied to the thread, so anything on another thread (`@Async`, `CompletableFuture.supplyAsync`, parallel streams) is **outside** it. The transaction spans the whole method, so don't do HTTP calls inside it — you hold a DB connection for the duration of a network call, and the pool drains.

`@Transactional(readOnly = true)` on queries: hints the driver and lets Hibernate skip dirty checking. Put `@Transactional` on service methods, not controllers or repositories (Spring Data repository methods are already transactional individually).

## Propagation

| Propagation | Existing transaction? | None? |
|---|---|---|
| `REQUIRED` (default) | join it | start one |
| `REQUIRES_NEW` | **suspend** it, start a new independent one | start one |
| `SUPPORTS` | join | run without |
| `NOT_SUPPORTED` | suspend, run without | run without |
| `MANDATORY` | join | throw |
| `NEVER` | throw | run without |
| `NESTED` | savepoint inside it (JDBC only, not JPA) | start one |

The question is always about `REQUIRED` vs `REQUIRES_NEW`:

- Inner `REQUIRED` method throws a runtime exception that the outer method **catches**: the inner interceptor already marked the shared transaction rollback-only, so the outer commit fails with `UnexpectedRollbackException`. You can't "handle" a failure inside the same transaction.
- `REQUIRES_NEW` for an audit log that must persist even if the business operation fails. Note it takes a **second connection** from the pool while the first is suspended; with a pool of 10 and nested `REQUIRES_NEW` under load you can deadlock on the pool.

## Isolation

| Level | Prevents | Notes |
|---|---|---|
| `READ_UNCOMMITTED` | nothing | dirty reads; Postgres treats it as read committed |
| `READ_COMMITTED` | dirty reads | Postgres and Oracle default |
| `REPEATABLE_READ` | + non-repeatable reads | MySQL/InnoDB default |
| `SERIALIZABLE` | + phantoms | transactions behave as if sequential; expect serialization failures to retry |
| `DEFAULT` | the database's default | what you should usually leave it at |

Set with `@Transactional(isolation = Isolation.SERIALIZABLE)` only on the specific method that needs it. Most correctness problems (lost updates on a counter) are better solved with `@Version` optimistic locking or `SELECT … FOR UPDATE` (`@Lock(PESSIMISTIC_WRITE)`) than with a higher isolation level.

## Rollback rules

By default Spring rolls back on **unchecked** exceptions (`RuntimeException`, `Error`) and **commits** on checked exceptions. The reasoning: checked exceptions are "expected business outcomes" in the EJB tradition. Nobody likes it; fix it per method:

```java
@Transactional(rollbackFor = Exception.class)      // roll back on everything
@Transactional(noRollbackFor = OutOfStock.class)   // commit despite this one
TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();   // programmatic
```

Or use `TransactionTemplate` when you need control inside a method:

```java
transactionTemplate.executeWithoutResult(status -> {
    repo.save(order);
    if (!inventory.reserve(order)) status.setRollbackOnly();
});
```

## The self-invocation trap

```java
@Service
public class ImportService {
    public void importAll(List<Row> rows) {
        for (Row r : rows) importOne(r);         // this.importOne — bypasses the proxy
    }

    @Transactional(propagation = REQUIRES_NEW)   // never applied via the call above
    public void importOne(Row r) { ... }
}
```

The caller invoked `importAll` through the proxy, but `importOne` is called on `this`, the raw object, so no interceptor runs: no new transaction, no `@Async` thread, no cache. Same for `private` methods and `final` methods. Fixes, best first: move `importOne` into another bean; inject `ObjectProvider<ImportService>`/`ApplicationContext` and call through `self.getObject().importOne(r)`; or `((ImportService) AopContext.currentProxy())` with `exposeProxy = true`. The first is the answer interviewers want.

## `@Async` and `@Cacheable`

Both are proxy-based, both need an enabler (`@EnableAsync`, `@EnableCaching` on a configuration class), both have the self-invocation trap.

```java
@Async                                     // runs on the "applicationTaskExecutor"
public CompletableFuture<Report> build(long id) { ... }   // return void or CompletableFuture; never a plain value

@Cacheable(value = "products", key = "#id", unless = "#result == null")
public Product find(long id) { ... }
@CachePut(value = "products", key = "#p.id")  public Product update(Product p) { ... }
@CacheEvict(value = "products", key = "#id")  public void delete(long id) { ... }
@CacheEvict(value = "products", allEntries = true) public void reload() { ... }
```

- `@Async` exceptions on a `void` method go to `AsyncUncaughtExceptionHandler`, not the caller. The thread pool is `TaskExecutionAutoConfiguration`'s: 8 core threads, unbounded queue by default; configure `spring.task.execution.pool.*` or it will quietly queue forever. With `spring.threads.virtual.enabled=true` it uses virtual threads.
- `@Cacheable` default store is a `ConcurrentHashMap`; for anything real use Caffeine (`spring-boot-starter-cache` + `caffeine`) with a TTL, or Redis for a shared cache. The cache key is built from the method parameters; make sure they have sane `equals`/`hashCode`.

## Writing one aspect

```java
@Target(ElementType.METHOD) @Retention(RetentionPolicy.RUNTIME)
public @interface Timed {}

@Aspect
@Component
public class TimingAspect {
    private static final Logger log = LoggerFactory.getLogger(TimingAspect.class);

    @Around("@annotation(com.acme.Timed)")
    public Object time(ProceedingJoinPoint pjp) throws Throwable {
        long start = System.nanoTime();
        try {
            return pjp.proceed();
        } finally {
            log.info("{} took {} ms", pjp.getSignature().toShortString(), (System.nanoTime() - start) / 1_000_000);
        }
    }

    @Before("execution(* com.acme.orders..*Service.*(..))")      // pointcut by package pattern
    public void audit(JoinPoint jp) { /* ... */ }
}
```

Needs `spring-boot-starter-aop` (AspectJ annotations, Spring proxies — no weaving). Advice types: `@Before`, `@After`, `@AfterReturning`, `@AfterThrowing`, `@Around` (the only one that controls the call). Multiple aspects on one method are ordered with `@Order`; `@Transactional` has lowest precedence by default, so your aspect runs outside the transaction unless you set `@EnableTransactionManagement(order = ...)`.

Good uses: timing/metrics, auditing, retry, tenant context. Bad uses: business logic — nobody can find it.

## Worked example: a transaction that silently doesn't roll back

```java
@Service
public class OrderService {
    private final OrderRepository orders;
    private final PaymentClient payments;

    public void checkout(Cart cart) {
        Order order = createOrder(cart); // self-invocation: no proxy, no transaction
        payments.charge(order);
    }

    @Transactional
    public Order createOrder(Cart cart) {
        Order order = orders.save(Order.from(cart));
        cart.items().forEach(item -> reserveStock(item)); // throws on the third item
        return order;
    }
}
```

The third reservation fails, yet the order row and the first two reservations stay in the database. Why: `checkout` calls `createOrder` on `this`, the raw object, not on the Spring proxy that wraps it. The `@Transactional` advice lives in the proxy, so no transaction is started; each repository call commits on its own.

Trace the two paths:

| Call | Goes through | Transaction? |
| --- | --- | --- |
| Controller → `orderService.createOrder(cart)` | Proxy → advice → target | Yes |
| `checkout` → `this.createOrder(cart)` | Target directly | No |

Fixes, best first:

1. Put `@Transactional` on the **entry point** (`checkout`), the method external callers use.
2. Move `createOrder` to another bean (for example `OrderWriter`), so the call crosses a proxy.
3. Inject the bean's own proxy (`@Lazy` self-injection) or use `TransactionTemplate` for programmatic control. These work but are a sign the boundaries need rethinking.

A second trap in the same code: charging the payment **inside** a database transaction would hold a database connection during a slow network call, and if the transaction later rolls back, the customer has been charged anyway. Keep remote calls outside transactions and use an outbox or compensation for consistency.

## Checked exceptions and rollback

By default a transaction rolls back on **unchecked** exceptions (`RuntimeException`, `Error`) and **commits** on checked ones:

```java
@Transactional
public void importFile(Path file) throws IOException {
    repository.save(header(file));
    parseLines(file); // throws IOException: the header is still committed
}

@Transactional(rollbackFor = Exception.class) // roll back on checked exceptions too
public void importFileSafely(Path file) throws IOException { ... }
```

Catching an exception inside the transactional method and not rethrowing also means the transaction commits, unless you mark it with `TransactionAspectSupport.currentTransactionStatus().setRollbackOnly()`.

## Common interview questions

**How does `@Transactional` work under the hood?**
The bean is replaced by a proxy whose interceptor starts or joins a transaction, binds the connection to the current thread so repositories share it, invokes the method, and commits or rolls back based on the exception. Because it's a proxy, only external calls to public methods are transactional.

**Why didn't my `@Transactional` method roll back?**
Common causes: a checked exception was thrown (default rolls back only on unchecked), the exception was caught inside the method, the method was called from the same class (self-invocation), it's `private`/`final`, or the class isn't a Spring bean at all.

**What's the difference between `REQUIRED` and `REQUIRES_NEW`?**
`REQUIRED` joins the caller's transaction so everything commits or rolls back together. `REQUIRES_NEW` suspends it and runs an independent transaction on a second connection — it commits even if the caller later fails. Use it for audit records or outbox writes that must survive.

**Why does catching an exception from an inner transactional call still fail the outer transaction?**
The inner proxy marked the shared transaction rollback-only before your `catch` ran. At the outer commit Spring throws `UnexpectedRollbackException`. Either let the failure propagate, or give the inner call `REQUIRES_NEW`.

**JDK proxy vs CGLIB — which does Spring use and why does it matter?**
Boot defaults to CGLIB subclasses so you can inject concrete types; JDK proxies need interfaces. It matters because CGLIB can't override `final` methods and neither can intercept `private` ones or self-invocations, which is where "the annotation is being ignored" bugs come from.

**Should you put `@Transactional` on a controller?**
No. Transactions belong on the service method that forms the unit of work; a controller transaction spans JSON serialisation and holds the connection longer. Also keep remote calls out of transactional methods for the same reason.

**What does `@Async` need to actually run asynchronously?**
`@EnableAsync`, a public method on a Spring bean called from another bean, and a `void` or `CompletableFuture` return type. Configure the executor's pool and queue, because the default queue is unbounded.

**How is Spring AOP different from AspectJ?**
Spring AOP is proxy-based: only public method executions on beans, applied at runtime, no bytecode change. AspectJ weaves at compile or load time and can advise constructors, fields and private methods. Spring AOP is enough for 99% of cross-cutting needs.

## Pitfalls

- `@Transactional` on an interface default method or a `private` method: ignored.
- Calling a remote API or sending an email inside the transaction: connection held during I/O; the email goes even if the commit fails. Use `@TransactionalEventListener(AFTER_COMMIT)` or an outbox.
- `@Cacheable` on a method returning a mutable entity: every caller gets the same instance and mutations leak.
- Testing transactions with `@Transactional` on the test class: the test's transaction rolls back at the end, hiding commit-time failures like constraint violations.
- `@Async` on a method that returns a value directly: callers get `null`.

## Key takeaways

- Spring AOP works through proxies; only calls that go through the proxy get advice.
- `@Transactional` opens, commits or rolls back around the proxied method; self-invocation bypasses it.
- Defaults: propagation `REQUIRED`, rollback on unchecked exceptions only.
- Keep remote calls out of database transactions.
- `@Async` and `@Cacheable` have the same proxy rules and pitfalls.
