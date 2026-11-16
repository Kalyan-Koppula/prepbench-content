---
title: SOLID in Java
order: 4
summary: Each principle with a short Java before and after, what it looks like in a Spring codebase, and the sentence to say when an interviewer asks for it.
---

SOLID questions are not about reciting the acronym. The interviewer wants a concrete violation, the refactor, and evidence you know when the principle is overkill. One example per principle, memorised, is enough.

## S — Single responsibility

A class should have one reason to change. "Responsibility" means a stakeholder or axis of change, not "one method".

```java
// Before: persistence, formatting and notification in one class
class InvoiceService {
    void process(Invoice inv) {
        jdbc.update("insert into invoices ...", inv.id(), inv.total());
        String pdf = "<html>" + inv.lines() + "</html>";
        smtp.send(inv.customerEmail(), "Your invoice", pdf);
    }
}

// After: one collaborator per reason to change
class InvoiceService {
    private final InvoiceRepository repo;
    private final InvoiceRenderer renderer;
    private final Notifier notifier;

    InvoiceService(InvoiceRepository repo, InvoiceRenderer renderer, Notifier notifier) {
        this.repo = repo; this.renderer = renderer; this.notifier = notifier;
    }
    void process(Invoice inv) {
        repo.save(inv);
        notifier.send(inv.customerEmail(), "Your invoice", renderer.render(inv));
    }
}
```

Interview phrasing: "The service orchestrates; storage, rendering and delivery each change for different reasons, so they are separate collaborators I can test in isolation." Over-applied, SRP produces hundreds of one-method classes; the test is whether two pieces of code change together in practice.

## O — Open/closed

Open for extension, closed for modification: add behaviour by adding code, not by editing a growing `switch`.

```java
// Before: every new payment method edits this method
BigDecimal fee(Payment p) {
    return switch (p.type()) {
        case "card" -> p.amount().multiply(new BigDecimal("0.029"));
        case "upi"  -> BigDecimal.ZERO;
        default -> throw new IllegalArgumentException(p.type());
    };
}

// After: a strategy per method, discovered by the container
interface FeePolicy { boolean supports(Payment p); BigDecimal fee(Payment p); }

@Component class CardFee implements FeePolicy { /* ... */ }
@Component class UpiFee implements FeePolicy { /* ... */ }

@Service class FeeService {
    private final List<FeePolicy> policies;           // Spring injects every FeePolicy bean
    FeeService(List<FeePolicy> policies) { this.policies = policies; }
    BigDecimal fee(Payment p) {
        return policies.stream().filter(fp -> fp.supports(p)).findFirst()
            .orElseThrow(() -> new IllegalArgumentException(p.type())).fee(p);
    }
}
```

Counterpoint worth saying: a `switch` over a sealed type is also a fine design when the set of cases is genuinely closed and you want the compiler to force every case to be handled. OCP is about expected axes of change, not banning `switch`.

## L — Liskov substitution

Subtypes must be substitutable for their supertype without surprising the caller.

```java
// Before: a read-only repository that is-a mutable one
interface Repository<T> { T find(String id); void save(T t); }
class ReadOnlyRepo<T> implements Repository<T> {
    public T find(String id) { /* ... */ return null; }
    public void save(T t) { throw new UnsupportedOperationException(); }   // callers cannot know
}

// After: split the contract
interface Reader<T> { T find(String id); }
interface Repository<T> extends Reader<T> { void save(T t); }
class ReadOnlyRepo<T> implements Reader<T> { public T find(String id) { /* ... */ return null; } }
```

Checklist: do not strengthen preconditions, do not weaken postconditions, do not throw where the parent would not, preserve invariants. `Square extends Rectangle` and `Collections.unmodifiableList` are the stock examples; see the inheritance article.

## I — Interface segregation

Clients should not depend on methods they do not use. Fat interfaces force no-op implementations and make mocking painful.

```java
// Before
interface Worker { void work(); void eat(); void attendStandup(); }
class Robot implements Worker { public void eat() {} public void attendStandup() {} /* ... */ }

// After: role interfaces, composed as needed
interface Workable { void work(); }
interface Feedable { void eat(); }
class Robot implements Workable { public void work() { } }
class Engineer implements Workable, Feedable { /* ... */ }
```

The JDK models this: `Iterable` versus `Collection` versus `List`, `Readable` versus `Reader`. In Spring Data, `CrudRepository` extends `Repository` precisely so you can expose a narrower repository. The LSP example above (`Reader` vs `Repository`) is also ISP; the two principles overlap.

## D — Dependency inversion

High-level policy depends on abstractions; low-level details implement them. Not the same as dependency injection: DI is a mechanism, DIP is the direction of the dependency arrow.

```java
// Before: business logic imports a concrete driver
class OrderService {
    private final PostgresOrderStore store = new PostgresOrderStore("jdbc:postgresql://...");
    void place(Order o) { store.insert(o); }
}

// After: the service owns the abstraction; infrastructure implements it
interface OrderStore { void insert(Order o); }               // declared next to OrderService

class OrderService {
    private final OrderStore store;
    OrderService(OrderStore store) { this.store = store; }   // constructor injection
    void place(Order o) { store.insert(o); }
}

class PostgresOrderStore implements OrderStore { public void insert(Order o) { /* JDBC */ } }
```

The interface lives in the domain package, the implementation in the infrastructure package, and the dependency arrows point inward. This is the structure behind hexagonal/ports-and-adapters and why Spring prefers constructor injection: the dependency is explicit, final, and the class can be unit-tested with a fake.

## Spring-flavoured phrasing

| Principle | What it looks like in Spring Boot |
|---|---|
| SRP | Controller maps HTTP, service holds use-case logic, repository persists; `@ControllerAdvice` owns error mapping |
| OCP | `List<Strategy>` injection, `@ConditionalOn...` auto-configuration, `Converter` registries |
| LSP | Any `JpaRepository` implementation satisfies the interface contract; proxies substitute for beans |
| ISP | Narrow repository interfaces, `@FunctionalInterface` callbacks, `HealthIndicator` |
| DIP | Constructor injection of interfaces; domain module has no Spring imports |

## When SOLID is overkill

- A startup CRUD app with two payment types does not need a strategy registry; a `switch` on a sealed type is clearer.
- An interface with exactly one implementation and no test double is ceremony; add it when the second implementation or the fake appears.
- SRP taken to extremes scatters one change across ten files. Cohesion matters as much as separation.

Saying this is what distinguishes a senior answer: principles describe forces, and you balance them against the cost of indirection.

## Common interview questions

**Explain SOLID in one sentence each.**
Single responsibility: one reason to change per class. Open/closed: extend by adding code, not editing it. Liskov: subtypes must honour the supertype's contract. Interface segregation: small, role-specific interfaces. Dependency inversion: policy depends on abstractions that infrastructure implements.

**Give an example of an SRP violation you fixed.**
A service that persisted, rendered and emailed an invoice; every change to the email template risked the persistence code and the tests needed a database. Splitting into repository, renderer and notifier made each testable and gave each its own change history.

**What is the difference between dependency inversion and dependency injection?**
DIP is a design rule about which module owns the abstraction: the high-level module declares the interface and the low-level one implements it. DI is the mechanism that supplies implementations at runtime, which Spring does for you. You can inject concrete classes and violate DIP; you can satisfy DIP with hand-written wiring.

**How does the open/closed principle relate to `switch` and sealed types?**
OCP says add cases without editing existing code, which strategy objects achieve. Sealed types deliberately choose the opposite: a closed set checked by the compiler. Pick OCP when the set of variants is expected to grow from outside; pick sealed when it is a fixed domain concept.

**How do you decide the size of an interface?**
By the client: each interface should match what one kind of caller needs. If implementers are writing empty methods or throwing `UnsupportedOperationException`, the interface is too big; split it into roles.

**What is a Liskov violation you have seen in the JDK?**
`Collections.unmodifiableList` returns a `List` whose mutators throw. Callers holding a `List` cannot tell, which is why `List.of` documents the same behaviour and modern APIs prefer separate read-only types or immutable-by-construction collections.

**Why does Spring recommend constructor injection?**
Dependencies are explicit and `final`, the object is never in a half-constructed state, circular dependencies fail fast, and tests can construct the class with fakes without a container. It is DIP made visible in the signature.
