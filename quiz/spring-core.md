---
title: Spring Core
order: 6
module: spring-core
summary: The container and DI, bean lifecycle and scopes, proxies and @Transactional, configuration precedence, profiles and auto-configuration.
---

## What does the Spring container actually do at startup?

It scans for stereotype classes and `@Bean` methods to build bean definitions, instantiates them in dependency order with constructor injection, runs post-processors that wrap some beans in proxies and bind properties, calls `@PostConstruct`, and keeps the singletons for the life of the context.

## Why is constructor injection preferred over field injection?

Fields can be `final` and the object is complete after construction; tests can call `new` with fakes; the signature exposes how many dependencies the class has; and missing or circular dependencies fail at startup instead of as an NPE later. A single constructor needs no `@Autowired`.

## What's the difference between `@Component` and `@Bean`?

`@Component` marks a class for classpath scanning, and Spring instantiates it. `@Bean` marks a factory method in a `@Configuration` class whose return value becomes the bean, which is how you register third-party types or build an object from configuration.

## Two beans implement the same interface. What happens when you inject it?

Startup fails with `NoUniqueBeanDefinitionException`. Resolve with `@Primary` on the default, `@Qualifier("name")` at the injection point, injecting a `List` or `Map` of all implementations, or making one conditional on a profile or property.

## How does Spring react to a circular dependency between two beans?

With constructor injection it refuses to start and names the cycle; Boot 2.6+ also rejects setter and field cycles unless you re-enable them. Fix the design by extracting the shared piece or using events; `@Lazy` on one parameter is the last resort.

## Is a `@Repository` annotation just documentation?

No. Besides marking the bean for scanning, it enables exception translation: persistence-specific exceptions from JPA or JDBC are converted into Spring's unchecked `DataAccessException` hierarchy, so services don't depend on the persistence technology.

## Why is a `@Configuration` class proxied by CGLIB?

So that one `@Bean` method calling another returns the container's singleton instead of running the method body again. `proxyBeanMethods = false` disables it for faster startup when you never make such inter-bean calls.

## In what order do constructor, `@PostConstruct` and proxy creation happen for a bean?

Constructor with constructor-injected dependencies, then field/setter injection, then `@PostConstruct` and `afterPropertiesSet`, then `BeanPostProcessor.postProcessAfterInitialization` where AOP proxies are created. So `@PostConstruct` runs on the raw object, before the proxy exists.

## What is a `BeanPostProcessor`?

A hook the container calls for every bean before and after initialisation that may return a replacement object. It's how `@Autowired`, `@PostConstruct`, `@Transactional` and `@Async` are implemented: the AOP post-processor returns a proxy instead of your bean.

## Is a Spring singleton the same as the GoF singleton pattern?

No: it's one instance per container, enforced by the container, not by a private constructor. Two application contexts have two instances, and nothing stops you calling `new` on the class.

## A `@Service` is injected into a `@RestController`. Is per-request state in that service safe?

No. Both are singletons shared by every request thread, so instance fields are shared mutable state and a data-leak bug. Keep them stateless; per-request data goes in method parameters or a request-scoped bean.

## You inject a prototype-scoped bean into a singleton. How many instances does the singleton see?

One, forever: injection happens once when the singleton is built. For a fresh instance per use inject `ObjectProvider<T>` and call `getObject()`, declare the prototype with a scoped proxy, or use a `@Lookup` method.

## How can a singleton hold a request-scoped bean at all?

Through a scoped proxy: `@RequestScope` sets `proxyMode`, so the singleton holds a proxy that resolves the real bean from the current request on every call. Outside a request the proxy throws `ScopeNotActiveException`.

## When would you turn on lazy initialisation?

To cut startup time in development or tests, or for a rarely used bean that's expensive to build. The cost is that a misconfigured bean is only discovered at first use, so production usually stays eager.

## Where should you put code that must run once the application is fully started?

In an `ApplicationReadyEvent` listener or an `ApplicationRunner`. `@PostConstruct` is too early: the web server isn't listening and other beans may not exist yet.

## Why might an event listener not see data the publisher just saved?

A plain `@EventListener` runs synchronously inside the publisher's transaction, before commit. Use `@TransactionalEventListener(phase = AFTER_COMMIT)` so the handler runs only after the write is durable.

## How does `@Transactional` work?

Other beans get a proxy whose interceptor begins or joins a transaction, binds the connection to the current thread so repositories share it, invokes your method, and commits on return or rolls back on a matching exception. It only applies to external calls to public methods of a Spring bean.

## Why did a `@Transactional` method not roll back when an exception was thrown?

Most likely one of: the exception was checked (default rolls back only on `RuntimeException` and `Error`), it was caught inside the method, the method was called from the same class, it's `private` or `final`, or the object wasn't a Spring bean. `rollbackFor = Exception.class` fixes the first.

## What's the self-invocation problem?

Calling another method on `this` bypasses the proxy, so `@Transactional`, `@Async`, `@Cacheable` or `@Retryable` on that inner method is silently ignored. Move the method to another bean, or inject the bean's own proxy via `ObjectProvider` and call through it.

## `REQUIRED` versus `REQUIRES_NEW` — when does it matter?

`REQUIRED` joins the caller's transaction so everything commits or rolls back together. `REQUIRES_NEW` suspends it and runs an independent transaction on a second connection that commits even if the caller later fails, which is what you want for audit records. It also doubles pool usage, so watch for pool deadlocks.

## Outer method catches an exception from an inner `@Transactional` call, but the commit still fails. Why?

The inner proxy already marked the shared transaction rollback-only before the `catch`, so the outer commit throws `UnexpectedRollbackException`. Either let the exception propagate or give the inner call `REQUIRES_NEW`.

## JDK dynamic proxy or CGLIB — which does Boot use and what can't be intercepted?

Boot defaults to CGLIB subclass proxies so concrete types can be injected. Neither mechanism can intercept `private` methods or self-invocations, and CGLIB additionally can't override `final` methods or classes.

## What does `@Async` need in order to actually run on another thread?

`@EnableAsync` on a configuration class, a public method on a Spring bean invoked from a different bean, and a `void` or `CompletableFuture` return type. Configure the executor; the default queue is unbounded and exceptions from `void` methods go to an uncaught-exception handler, not the caller.

## `@Value` versus `@ConfigurationProperties`?

`@Value` injects one property into one place as a string expression. `@ConfigurationProperties` binds a whole prefix onto a typed, validated, preferably immutable record you inject and unit-test like any bean. Use `@Value` for a single value and a properties class per subsystem.

## In what order do Spring Boot property sources override each other?

Command-line args beat Java system properties, which beat OS environment variables, which beat profile-specific files, which beat `application.yml`; files outside the jar beat packaged ones. `/actuator/env` lists every source in order with the winning value.

## How does Boot know how to auto-configure a `DataSource`, and how do you override it?

`DataSourceAutoConfiguration` is guarded by `@ConditionalOnClass(DataSource.class)` and creates a Hikari pool `@ConditionalOnMissingBean`. It's evaluated after your configuration, so defining your own `DataSource` bean makes the condition fail and Boot backs off.

## How do you find out why Boot didn't create a bean you expected?

Run with `--debug` or open `/actuator/conditions` and read the negative matches: a required class missing from the classpath, a property not set, or a bean of that type already present. For your own beans, check the package is under the main class and the profile is active.

## How do you keep secrets out of `application.yml`?

Reference them as placeholders and supply them at runtime: environment variables, mounted secret files via `spring.config.import=optional:configtree:/run/secrets/`, or Vault and cloud secret managers through `spring.config.import`. Validate presence with `@ConfigurationProperties` and `@NotBlank` so a missing secret fails startup.
