---
title: Design Patterns Interviewers Expect
order: 5
summary: Builder, factory, strategy, singleton (enum, lazy holder, and why double-checked locking needs volatile), observer, template method and decorator — with the Java idiom for each and when it is overkill.
---

Nobody asks you to recite the Gang of Four. They ask "how would you build this" and expect to see one of about seven patterns appear in your code with its Java idiom, and they ask the singleton question to see whether you understand the memory model. This is the list.

## Builder

For objects with many optional fields, where a constructor with ten parameters or telescoping constructors would be unreadable.

```java
public final class HttpRequest {
    private final String url;
    private final String method;
    private final Map<String, String> headers;
    private final Duration timeout;

    private HttpRequest(Builder b) {
        url = b.url; method = b.method; headers = Map.copyOf(b.headers); timeout = b.timeout;
    }

    public static Builder builder(String url) { return new Builder(url); }

    public static final class Builder {
        private final String url;
        private String method = "GET";
        private final Map<String, String> headers = new HashMap<>();
        private Duration timeout = Duration.ofSeconds(30);

        private Builder(String url) { this.url = Objects.requireNonNull(url); }
        public Builder method(String m) { method = m; return this; }
        public Builder header(String k, String v) { headers.put(k, v); return this; }
        public Builder timeout(Duration d) { timeout = d; return this; }
        public HttpRequest build() {
            if (timeout.isNegative()) throw new IllegalStateException("negative timeout");
            return new HttpRequest(this);
        }
    }
}

var req = HttpRequest.builder("https://x").method("POST").header("Accept", "json").build();
```

- Required fields go in the builder constructor; optional ones have defaults; `build()` validates cross-field rules.
- The product stays immutable; only the builder mutates.
- Lombok `@Builder` generates exactly this, and on a record it generates a builder over the canonical constructor. Interviewers accept "I'd use Lombok's `@Builder`" if you can describe what it generates and its trap: `@Builder` alone does not fill defaults from field initialisers unless you add `@Builder.Default`.
- Overkill when there are three fields and all are required. Use a record or a static factory.

## Factory

Static factory method: a named constructor, possibly returning a subtype or a cached instance.

```java
public interface Shape { static Shape circle(double r) { return new Circle(r); } }
```

Factory method pattern (polymorphic creation): a subclass or strategy decides which concrete type to make. In Spring the common form is a map of strategies keyed by type:

```java
@Component
class NotifierFactory {
    private final Map<Channel, Notifier> byChannel;
    NotifierFactory(List<Notifier> all) {
        byChannel = all.stream().collect(Collectors.toMap(Notifier::channel, n -> n));
    }
    Notifier forChannel(Channel c) {
        return Optional.ofNullable(byChannel.get(c)).orElseThrow(() -> new IllegalArgumentException(c.name()));
    }
}
```

Abstract factory (a factory of related families) is rarely needed outside UI toolkits; say so if asked. Overkill: a factory whose only job is `new X()`.

## Strategy

Swap an algorithm at runtime behind an interface. In Java 21 a strategy is usually a functional interface and often just a lambda.

```java
interface PricingStrategy { BigDecimal price(Cart cart); }

PricingStrategy standard = cart -> cart.subtotal();
PricingStrategy member   = cart -> cart.subtotal().multiply(new BigDecimal("0.9"));

class Checkout {
    private final PricingStrategy pricing;
    Checkout(PricingStrategy pricing) { this.pricing = pricing; }
    BigDecimal total(Cart c) { return pricing.price(c); }
}
```

When the strategies are a closed, known set, an enum with a method per constant is cleaner. When they are open and discovered at runtime, inject a `List` or `Map` of them. Overkill: two strategies that will never grow; an `if` is fine.

## Singleton

One instance per JVM (per class loader, strictly). Three correct ways and the famous wrong way.

```java
// 1. Enum: simplest, serialisation- and reflection-safe. Josh Bloch's recommendation.
public enum Registry {
    INSTANCE;
    private final Map<String, String> entries = new ConcurrentHashMap<>();
    public void register(String k, String v) { entries.put(k, v); }
}

// 2. Eager static field: fine when construction is cheap.
public final class Config {
    private static final Config INSTANCE = new Config();
    private Config() {}
    public static Config get() { return INSTANCE; }
}

// 3. Initialisation-on-demand holder: lazy, thread-safe via class loading, no locks.
public final class Pool {
    private Pool() {}
    private static final class Holder { static final Pool INSTANCE = new Pool(); }
    public static Pool get() { return Holder.INSTANCE; }
}
```

### Double-checked locking and `volatile`

```java
public final class Lazy {
    private static volatile Lazy instance;          // volatile is mandatory
    private Lazy() {}
    public static Lazy get() {
        Lazy local = instance;                      // one volatile read on the fast path
        if (local == null) {
            synchronized (Lazy.class) {
                local = instance;
                if (local == null) instance = local = new Lazy();
            }
        }
        return local;
    }
}
```

Without `volatile`, `instance = new Lazy()` can be reordered by the compiler or CPU so that the reference is published before the constructor's field writes are visible. A second thread then passes the first null check and uses a half-constructed object. `volatile` establishes a happens-before edge between the write and any later read. The holder idiom gets the same laziness without any of this, which is why DCL is an interview question rather than a recommendation.

Why singletons are a smell in application code: global state, hidden dependencies, hard to test. In Spring, beans are singletons by default and injected, which gives the single instance without the static access.

## Observer

Subscribers register for events; the subject notifies them without knowing who they are.

```java
interface OrderListener { void onPlaced(Order o); }

class OrderEvents {
    private final List<OrderListener> listeners = new CopyOnWriteArrayList<>();
    void subscribe(OrderListener l) { listeners.add(l); }
    void placed(Order o) { listeners.forEach(l -> l.onPlaced(o)); }
}
```

- `CopyOnWriteArrayList` so a listener can unsubscribe during notification without `ConcurrentModificationException`.
- Decide and document whether notification is synchronous; a slow listener blocks the publisher.
- In Spring use `ApplicationEventPublisher` and `@EventListener` (optionally `@TransactionalEventListener`, `@Async`) rather than a hand-rolled list. Across services, a message broker.
- Overkill: one listener that you own; call it directly.

## Template method

A fixed algorithm in a superclass with abstract or overridable steps.

```java
abstract class ImportJob {
    public final void run() {               // final: the skeleton is not for overriding
        var rows = read();
        var valid = rows.stream().filter(this::validate).toList();
        write(valid);
        afterWrite(valid.size());
    }
    protected abstract List<Row> read();
    protected abstract void write(List<Row> rows);
    protected boolean validate(Row r) { return true; }   // hook with a default
    protected void afterWrite(int n) {}                  // optional hook
}
```

Inheritance-based, so it couples subclasses to the base. The functional alternative is to pass the steps as lambdas or a strategy object, which is what Spring's `JdbcTemplate`/`TransactionTemplate` do despite the name. Prefer the functional form unless there are several related hooks sharing state.

## Decorator

Wrap an object with the same interface to add behaviour without subclassing. The JDK's I/O streams are the classic: `new BufferedReader(new InputStreamReader(in))`.

```java
interface Repo { Order find(String id); }

class CachingRepo implements Repo {
    private final Repo inner;
    private final Map<String, Order> cache = new ConcurrentHashMap<>();
    CachingRepo(Repo inner) { this.inner = inner; }
    public Order find(String id) { return cache.computeIfAbsent(id, inner::find); }
}

class TimedRepo implements Repo {
    private final Repo inner;
    TimedRepo(Repo inner) { this.inner = inner; }
    public Order find(String id) {
        long t0 = System.nanoTime();
        try { return inner.find(id); }
        finally { System.out.println("find took " + (System.nanoTime() - t0) / 1_000_000 + "ms"); }
    }
}

Repo repo = new TimedRepo(new CachingRepo(new JdbcRepo()));   // compose freely, order matters
```

Spring AOP (`@Transactional`, `@Cacheable`, `@Retryable`) is decorator applied by proxy; that is the answer to "how does `@Transactional` work" at the design level. Overkill: one cross-cutting concern on one class, where a few lines inline are clearer. Pitfall: forwarding boilerplate for wide interfaces; use Lombok `@Delegate` or keep interfaces narrow (ISP).

## Others to recognise by name

- **Adapter**: convert one interface to another (`Arrays.asList`, `InputStreamReader`).
- **Facade**: one simple entry point over a subsystem (`JdbcTemplate`, a service that calls three repositories).
- **Proxy**: same interface, controls access (Spring AOP proxies, lazy JPA entities).
- **Chain of responsibility**: `Filter` chains in servlets, Spring Security.
- **Command**: `Runnable`/`Callable` submitted to an executor.
- **Iterator**: `Iterable`/`Iterator`, for-each.
- **Null object**: `Collections.emptyList()`, a `NoopNotifier` instead of `null` checks.

## When any pattern is overkill

The test is whether the pattern removes a real axis of change or merely adds indirection. A pattern with one implementation, no test double and no planned variation is ceremony. Name the pattern you are not using and why; that answer scores higher than applying it.

## Common interview questions

**Why does double-checked locking need `volatile`?**
Without it, the JIT or CPU may publish the reference before the object's fields are written, so another thread can see a non-null but uninitialised instance. `volatile` forbids that reordering and makes the write visible. The holder idiom avoids the problem entirely by relying on class-initialisation guarantees.

**What is the best way to implement a singleton in Java?**
A single-element enum: thread-safe by class loading, immune to reflection and serialisation attacks, and one line. If you need laziness with a non-enum class, the static holder idiom. In Spring, just let the container manage a singleton bean.

**When would you use a builder instead of a constructor?**
When there are more than roughly four parameters, several are optional, or validation spans fields. The builder gives named steps, defaults and a validated immutable result. For a small all-required type, a record is better.

**Strategy versus template method?**
Both vary a step of an algorithm. Strategy uses composition: the varying part is an object passed in, swappable at runtime and testable alone. Template method uses inheritance: the subclass overrides hooks. Prefer strategy unless several hooks share state.

**How does the decorator pattern show up in Java?**
The I/O stream classes wrap each other to add buffering, decoding or compression, and Spring's proxies decorate beans with transactions, caching and retries. The point is adding behaviour without subclassing and composing wrappers in any order.

**Where is the observer pattern in the JDK and Spring?**
`PropertyChangeListener`, `Flow.Subscriber` in `java.util.concurrent`, and Spring's `ApplicationEventPublisher` with `@EventListener`. Hand-rolled versions should use `CopyOnWriteArrayList` and state whether delivery is synchronous.

**What is wrong with singletons?**
Global mutable state, hidden dependencies, order-dependent initialisation and untestable code because you cannot substitute the instance. Dependency injection gives you one instance without the static access, which is what frameworks do.

**Factory method versus abstract factory?**
Factory method is one method that creates one product, often overridden or chosen by key. Abstract factory is an object that creates a family of related products so they are consistent (a look-and-feel's buttons and menus). The second is rare in backend code.
