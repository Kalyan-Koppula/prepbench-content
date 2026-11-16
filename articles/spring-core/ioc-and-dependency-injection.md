---
title: IoC and Dependency Injection
order: 1
summary: What the container does, stereotypes, @Configuration/@Bean, why constructor injection, @Qualifier/@Primary/@Value, circular dependencies, and how it compares to NestJS.
---

"Explain dependency injection" is the first Spring question in almost every interview, and the follow-ups ("why constructor injection?", "what if there are two beans of that type?", "what happens with a circular dependency?") separate people who have read about Spring from people who have debugged it.

## What the container does

The `ApplicationContext` is an object graph builder. At startup it:

1. **Scans** the classpath under your main class's package for classes annotated with a stereotype, and reads `@Configuration` classes for `@Bean` methods. Each becomes a **bean definition** (class, scope, dependencies).
2. **Instantiates** beans in dependency order, resolving each constructor parameter by type (then qualifier), and injects them.
3. **Post-processes** them: wraps some in proxies (`@Transactional`, `@Async`, AOP), binds `@Value` and `@ConfigurationProperties`, calls `@PostConstruct`.
4. Holds them as **singletons** — one instance per context — and hands them out on request (`context.getBean(OrderService.class)`), which you rarely do yourself.

Inversion of control: your classes declare what they need and never `new` their collaborators; the container decides which implementation, when, and with what configuration. The payoff is that `OrderService` can be unit-tested with a fake repository and run in production with a JPA one, with no code change.

From Express: the equivalent is manually wiring `const service = new OrderService(new PgRepo(pool))` in `app.js`. Spring does that wiring from annotations, for hundreds of classes, with lifecycle management and proxies.

## Declaring beans

```java
@Service                                   // stereotype → component scan creates one instance
public class OrderService {
    private final OrderRepository repo;
    private final PaymentGateway payments;

    public OrderService(OrderRepository repo, PaymentGateway payments) {   // single ctor → injected, no @Autowired needed
        this.repo = repo;
        this.payments = payments;
    }
}

@Configuration                             // explicit factory for things you don't own or need to build
public class ClientConfig {
    @Bean
    RestClient paymentsClient(RestClient.Builder builder, PaymentsProps props) {
        return builder.baseUrl(props.baseUrl()).build();
    }

    @Bean
    Clock clock() { return Clock.systemUTC(); }
}
```

| Annotation | Meaning | Extra behaviour |
|---|---|---|
| `@Component` | generic bean | none |
| `@Service` | business logic | none; documentation only |
| `@Repository` | data access | translates persistence exceptions into Spring's `DataAccessException` hierarchy |
| `@Controller` / `@RestController` | web handler | picked up by MVC's handler mapping; `@RestController` adds `@ResponseBody` |
| `@Configuration` | source of `@Bean` methods | CGLIB-proxied so calling one `@Bean` method from another returns the singleton, not a new object (`proxyBeanMethods = false` to opt out for speed) |

Use `@Bean` for third-party classes (`ObjectMapper`, `RestClient`, `DataSource`), for anything needing constructor arguments from config, and for choosing an implementation conditionally. Use stereotypes for your own classes.

## Constructor injection, and why

```java
// preferred
public OrderService(OrderRepository repo) { this.repo = Objects.requireNonNull(repo); }

// avoid
@Autowired private OrderRepository repo;          // field injection
@Autowired public void setRepo(OrderRepository r)  // setter injection: for optional deps only
```

The argument you should be able to make:

- **Immutability**: `final` fields; the object is fully formed after construction and can't be left half-wired.
- **Testability**: `new OrderService(fakeRepo)` in a unit test with no Spring, no reflection, no `@InjectMocks`.
- **Explicit dependencies**: a constructor with eight parameters is a visible design smell; eight `@Autowired` fields hide it.
- **Fails fast**: a missing dependency fails at startup, not with an NPE on first use; circular dependencies are detected rather than silently permitted.
- Since Spring 4.3 a single constructor is autowired implicitly; with Lombok, `@RequiredArgsConstructor` writes it.

Field injection is still what you'll see in legacy code and in tests (`@Autowired MockMvc mockMvc` is fine there).

## Resolving ambiguity

Injection is by type. Two beans implementing `PaymentGateway` cause `NoUniqueBeanDefinitionException` at startup. Options:

```java
@Primary @Component class StripeGateway implements PaymentGateway {}       // default winner
@Component("paypal") class PaypalGateway implements PaymentGateway {}

public Checkout(@Qualifier("paypal") PaymentGateway gw) {}                   // pick explicitly

public Router(List<PaymentGateway> all, Map<String, PaymentGateway> byName) {}   // inject every implementation

public Checkout(Optional<Fraud> fraud, ObjectProvider<Audit> audit) {}       // optional / lazy lookup
```

Parameter-name matching also works as a fallback qualifier (`PaymentGateway paypal`) if compiled with `-parameters`, but don't rely on it. Custom qualifier annotations (`@Qualifier` meta-annotated) are the typed version for larger codebases.

## `@Value` and properties

```java
public Mailer(@Value("${mail.from}") String from,
              @Value("${mail.retries:3}") int retries,                // default
              @Value("#{systemProperties['user.home']}") String home) // SpEL
```

For more than two values, bind a `@ConfigurationProperties` record instead (configuration article). `@Value` is fine for one-offs.

## Circular dependencies

`A` needs `B` and `B` needs `A`. With constructor injection, Spring cannot build either and fails at startup with `BeanCurrentlyInCreationException`; Boot 2.6+ also forbids the field/setter-injection workaround by default (`spring.main.allow-circular-references=true` re-enables it, don't). The fix is design: extract the shared piece into a third bean `C` that both depend on, or invert one direction with an event (`ApplicationEventPublisher`). Last resorts: `@Lazy` on one constructor parameter (injects a proxy that resolves on first call) or `ObjectProvider<B>`.

Interviewers want to hear "the cycle is a design problem, the container just surfaces it early".

## Compared with Node

| | Express | NestJS | Spring |
|---|---|---|---|
| Container | none; wire by hand or a library (Awilix, tsyringe) | yes, per module | yes, one context (plus optional hierarchy) |
| Registration | — | `@Injectable()` + listed in a module's `providers` | classpath scan of stereotypes + `@Bean` |
| Resolution key | — | class token or string token, via TS `emitDecoratorMetadata` | type, then qualifier/name |
| Injection style | — | constructor (reflection on types) | constructor (reflection on types) |
| Scope | — | singleton default; `Scope.REQUEST`, `TRANSIENT` | singleton default; `prototype`, `request`, `session` |
| Cycles | — | `forwardRef()` | fail at startup; redesign or `@Lazy` |
| Cross-cutting | middleware | interceptors, guards, pipes | AOP proxies (`@Transactional`, `@Async`), filters, interceptors |
| Config | `process.env` | `ConfigModule` | `Environment`, `@Value`, `@ConfigurationProperties` |

If you've used NestJS you already know DI; the Spring deltas are classpath scanning instead of explicit module lists, proxies doing real work on your beans, and a much larger set of things the container itself provides (transactions, caching, validation, security).

## Common interview questions

**What is inversion of control and what does Spring invert?**
Control over object creation and wiring. Instead of a class constructing its collaborators, it declares them and the container constructs the whole graph, choosing implementations, lifecycle and decorations such as transactions. The class depends on abstractions it never instantiates.

**Why is constructor injection recommended over field injection?**
Final fields and a fully initialised object, trivial unit testing with `new`, dependencies visible in the signature, and startup-time failure for missing or circular dependencies. Field injection needs reflection and leaves the object mutable and testable only through Spring or `@InjectMocks`.

**What's the difference between `@Component` and `@Bean`?**
`@Component` marks a class to be discovered by scanning; Spring instantiates it. `@Bean` marks a method in a `@Configuration` class whose return value is the bean; you instantiate it, which is how you register third-party classes or build an object from properties.

**Two beans implement the same interface. What happens and how do you fix it?**
Startup fails with `NoUniqueBeanDefinitionException`. Mark one `@Primary`, choose with `@Qualifier`, inject a `List`/`Map` of all of them, or make one conditional on a profile or property so only one exists.

**How does Spring handle a circular dependency?**
With constructor injection it refuses to start and names the cycle; Boot also rejects setter/field cycles by default. Break the cycle by extracting the shared responsibility, using events, or as a last resort `@Lazy`-injecting one side.

**Does `@Autowired` still have a use?**
It's optional on a single constructor since 4.3 and in Lombok-generated constructors. You still see it for setter injection of optional dependencies, on test fields, and with `required = false`. Prefer `Optional<T>` or `ObjectProvider<T>` for optionality.

**Why is `@Configuration` proxied?**
So that calling one `@Bean` method from another inside the class returns the container-managed singleton rather than executing the method body again. `proxyBeanMethods = false` turns that off for faster startup when you never do inter-bean calls.

**How does this compare to NestJS?**
Same idea: constructor injection by type with singleton default. NestJS needs explicit module provider lists and `forwardRef` for cycles; Spring scans the classpath, fails on cycles, and uses proxies to add transactions or caching to beans without wrappers.

## Pitfalls

- Creating a `@Service` with `new` in another bean: it works, but it's not the managed instance — no proxies, no injected fields.
- Putting the main class in the default package or a package that doesn't contain your code: scanning starts at the main class's package, so nothing is found.
- `@Value("${x}")` on a `static` field: silently never set.
- Injecting `List<Foo>` and expecting a particular order: add `@Order` or implement `Ordered`.
- Two `@Bean` methods returning the same type without names/qualifiers: ambiguity, found only at startup of the module that injects it.
