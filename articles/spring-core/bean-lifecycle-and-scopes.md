---
title: Bean Lifecycle and Scopes
order: 2
summary: Singleton vs prototype vs request, @PostConstruct/@PreDestroy, BeanPostProcessor, lazy init, context events, and what "bean" and "context" mean when you say them in an interview.
---

Interviewers ask about the bean lifecycle to see whether you understand that Spring does things to your objects after constructing them — proxying, injecting, initialising — and in what order. Scopes come up as "is a controller thread-safe?" and "how do I get a new instance each time?".

## Vocabulary

- **Bean**: an object whose lifecycle the container manages. Not every object is a bean; `new Money(...)` is just an object.
- **Bean definition**: the recipe (class, scope, constructor args, init method) that the container reads from annotations or `@Bean` methods.
- **ApplicationContext**: the container — the registry of definitions and singleton instances, plus the `Environment`, event bus, resource loader and message source. `BeanFactory` is its minimal interface; you always use `ApplicationContext`.
- **Context refresh**: the startup phase in which all definitions are processed and non-lazy singletons are created. "The context failed to start" means something in this phase threw.

Say "the container creates a singleton bean for each `@Service` during context refresh" and you sound like you've been there.

## Lifecycle of one bean

```text
1. Read definition (scan / @Bean)
2. Instantiate (constructor runs; constructor-injected deps are already built)
3. Populate (field/setter injection, @Value)
4. Aware callbacks (BeanNameAware, ApplicationContextAware …)
5. BeanPostProcessor.postProcessBeforeInitialization
6. Init: @PostConstruct → InitializingBean.afterPropertiesSet() → @Bean(initMethod)
7. BeanPostProcessor.postProcessAfterInitialization   ← proxies are created here
8. Ready; held as singleton
   … application runs …
9. Destroy on context close: @PreDestroy → DisposableBean.destroy() → @Bean(destroyMethod)
```

```java
@Component
public class CacheWarmer {
    private final ProductRepository repo;
    private final Map<Long, Product> cache = new ConcurrentHashMap<>();

    public CacheWarmer(ProductRepository repo) { this.repo = repo; }

    @PostConstruct                 // deps injected, safe to use them; runs once for singletons
    void warm() { repo.findTop100().forEach(p -> cache.put(p.id(), p)); }

    @PreDestroy                    // context shutdown; flush, close, deregister
    void flush() { cache.clear(); }
}
```

Why not do the work in the constructor? With constructor injection it's usually fine — dependencies are present. `@PostConstruct` matters when you need field/setter-injected values, or when the method must run **after** proxying-related setup, or simply to keep constructors side-effect-free. A thrown exception in either fails startup.

Destroy callbacks run only for singletons (and other scopes the container owns, like request); prototype beans are handed to you and forgotten. Boot registers a JVM shutdown hook, so `@PreDestroy` runs on `SIGTERM`.

## `BeanPostProcessor` in a paragraph

A `BeanPostProcessor` is a bean the container calls for **every other bean** before and after initialisation, and it may return a different object. That single hook is how most Spring "magic" is implemented: `AutowiredAnnotationBeanPostProcessor` performs injection, `CommonAnnotationBeanPostProcessor` handles `@PostConstruct`, and the AOP infrastructure returns a proxy in `postProcessAfterInitialization`, which is why the object other beans receive for an `@Transactional` service is a subclass or JDK proxy rather than your class. You rarely write one, but a custom BPP is the answer to "how would you apply something to every bean matching X" (for example, wrapping every `@Timed` method). `BeanFactoryPostProcessor` is the earlier sibling that edits bean **definitions** before any instantiation — `PropertySourcesPlaceholderConfigurer` is one.

## Scopes

| Scope | Instances | Available | Typical |
|---|---|---|---|
| `singleton` (default) | one per context | always | services, repositories, controllers, clients |
| `prototype` | new one per injection/`getBean` | always | stateful helpers, builders |
| `request` | one per HTTP request | web | per-request context holders |
| `session` | one per HTTP session | web | shopping cart in a server-session app |
| `application` | one per `ServletContext` | web | rarely |
| `websocket` | one per WebSocket session | websocket | rarely |

```java
@Component
@Scope("prototype")
public class ReportBuilder { /* mutable state */ }

@Component
@RequestScope                       // shorthand for @Scope(value = "request", proxyMode = TARGET_CLASS)
public class RequestContext { private String tenantId; /* getters/setters */ }
```

Consequences people get asked about:

- Singletons are shared across threads, so a `@Service` or `@RestController` must be **stateless** or use thread-safe state. A mutable field on a controller is a bug.
- Injecting a `prototype` into a `singleton` gives the singleton **one** prototype instance forever — injection happens once. To get a fresh one per call, inject `ObjectProvider<ReportBuilder>` and call `getObject()`, or use `@Lookup`, or a scoped proxy.
- Injecting a `request`-scoped bean into a singleton only works because `@RequestScope` sets a **scoped proxy**: the singleton holds a proxy that resolves the real bean from the current request on every call. Outside a request the proxy throws `ScopeNotActiveException`.
- Request scope is thread-local in nature; it does not follow you into `@Async` work or a different thread.

## Lazy initialisation

Singletons are eagerly created at refresh so that misconfiguration fails at startup. `@Lazy` defers one bean until first use; `spring.main.lazy-initialization=true` defers all of them, which cuts startup time (useful for dev and tests) at the price of discovering wiring errors on the first request. Boot's own guidance: keep eager in production unless startup time is the bottleneck. `@Lazy` on an injection point injects a lazy-resolving proxy, which is the standard trick for breaking a circular dependency.

## Context events

The context is also an event bus. Publish and listen in-process, synchronously by default:

```java
public record OrderPlaced(long orderId) {}

@Service
public class OrderService {
    private final ApplicationEventPublisher events;
    public OrderService(ApplicationEventPublisher events) { this.events = events; }

    @Transactional
    public void place(Order o) { repo.save(o); events.publishEvent(new OrderPlaced(o.id())); }
}

@Component
public class EmailOnOrder {
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)   // only after the order really exists
    public void on(OrderPlaced e) { mailer.sendConfirmation(e.orderId()); }

    @EventListener(ApplicationReadyEvent.class)                           // app fully started, safe to do work
    public void ready() { log.info("ready"); }
}
```

Lifecycle events worth knowing: `ApplicationStartingEvent`, `ApplicationEnvironmentPreparedEvent`, `ContextRefreshedEvent`, `ApplicationStartedEvent`, `ApplicationReadyEvent` (do warm-up here, not in `main`), `ContextClosedEvent`. Add `@Async` to a listener to run it on another thread; the publisher then doesn't see its exceptions. Events decouple modules inside one process; for cross-service you still need a broker.

## Boot startup in one breath

`SpringApplication.run` builds the `Environment` (properties, profiles), creates the `ApplicationContext`, registers your main class, runs auto-configuration to add definitions, refreshes the context (the lifecycle above, for every singleton), starts the embedded server, then runs `CommandLineRunner`/`ApplicationRunner` beans and publishes `ApplicationReadyEvent`.

## Common interview questions

**Is a Spring singleton the same as the singleton pattern?**
No. It's one instance **per container**, enforced by the container, not by a private constructor and static field. Two contexts (or tests with different configurations) have two instances, and you can still `new` the class.

**Is a `@RestController` thread-safe?**
It's a singleton shared by every request thread, so it's only as safe as you make it: keep it stateless and hold only injected singletons. Per-request state goes in method parameters or a request-scoped bean.

**How do you get a new prototype instance each time inside a singleton?**
Inject `ObjectProvider<T>` (or `Provider<T>`) and call `getObject()` per use, or declare the prototype with a scoped proxy, or use a `@Lookup` method. Plain injection resolves once at construction.

**`@PostConstruct` vs constructor — when do you use which?**
Constructor for assigning dependencies; `@PostConstruct` for work that needs the bean fully wired (including field injection), has side effects, or should be skipped in a plain unit test that uses `new`. Both fail startup if they throw.

**What's a `BeanPostProcessor` and have you used one?**
A hook called for every bean around initialisation that can replace the bean, typically with a proxy. Spring's `@Transactional`, `@Async` and `@Autowired` support are post-processors. A custom one is justified for cross-cutting instrumentation; otherwise use an aspect.

**When would you make initialisation lazy?**
To speed up startup in development or tests, or for a rarely used bean that's expensive to build. The trade-off is that a misconfigured bean is only discovered at first use, so production usually stays eager.

**How do you run code once the app has fully started?**
Listen for `ApplicationReadyEvent` or implement `ApplicationRunner`. Doing it in `@PostConstruct` is too early: the web server isn't up and other beans may not exist yet.

**Why would an event listener see an entity that doesn't exist yet?**
A plain `@EventListener` runs synchronously inside the publisher's transaction, before commit. Use `@TransactionalEventListener(AFTER_COMMIT)` so the handler runs only after the data is durable.

## Pitfalls

- Mutable instance fields on singletons: the classic data-leak-between-users bug.
- A `@PostConstruct` that calls a `@Transactional` method on itself: the proxy isn't in play yet (and self-invocation bypasses it anyway), so no transaction.
- Expecting `@PreDestroy` on a prototype bean to run. It doesn't; the container doesn't track prototypes.
- Reading a request-scoped bean from a scheduled job: `ScopeNotActiveException`.
- `@EventListener` on a method with two parameters: Spring can't bind it; one event parameter only.
