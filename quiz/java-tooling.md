---
title: Ecosystem and Tooling
order: 5
module: java-tooling
summary: Maven resolution and lifecycle, JARs and the classpath, JVM flags and diagnostics, JUnit/Mockito, Lombok/Jackson/logging, and running Boot in containers.
---

## Maven finds two versions of the same library in the dependency tree. Which one wins?

The one nearest the root of the tree; at equal depth, the first one declared in the POM. Maven never picks "highest" — Gradle does. To force a version, pin it in `dependencyManagement`, which is exactly what the Spring Boot parent does for its managed libraries.

## What's the difference between `mvn package`, `mvn install` and `mvn verify`?

`package` builds the jar into `target/`. `verify` runs after `package` and executes integration tests and quality checks, so it's what CI should run. `install` goes one step further and copies the artifact into `~/.m2` so other local projects can resolve it.

## When would you use `provided` scope?

For something that's needed to compile but supplied at runtime by the environment or not needed at all: the Servlet API when deploying a WAR to an app server, or Lombok, which only runs at compile time as an annotation processor. It is not packaged and not passed on transitively.

## What is a BOM and why import it with `scope import`?

A POM containing only `dependencyManagement`, publishing a set of mutually compatible versions. Importing it with `type pom, scope import` lets you declare those libraries without versions and trust they align. Boot, Testcontainers, AWS SDK and Spring Cloud all publish one.

## Why do integration tests run under failsafe rather than surefire?

Surefire runs in the `test` phase and fails the build before packaging, so a packaged artifact or started container wouldn't exist yet. Failsafe runs in `integration-test` and only reports failure in `verify`, so `post-integration-test` can still tear down containers.

## What's the difference between a Maven profile and a Spring profile?

A Maven profile changes the build: which dependencies, plugins or properties are used when you pass `-P`. A Spring profile changes the runtime: which beans and property documents are active when `spring.profiles.active` is set. They're unrelated, and mixing them up in an answer is a common slip.

## How is a Spring Boot executable jar structured differently from a shaded fat jar?

A shaded jar unpacks every dependency's classes into one flat jar, which can merge resources unpredictably and breaks signed jars. A Boot jar keeps dependencies as nested jars under `BOOT-INF/lib` with your classes in `BOOT-INF/classes`, and a `JarLauncher` main class sets up a classloader that reads them in place.

## `ClassNotFoundException` versus `NoClassDefFoundError` — what does each tell you?

`ClassNotFoundException` is thrown by an explicit lookup like `Class.forName` when the class is simply not on the classpath. `NoClassDefFoundError` is thrown when the JVM needs a class it resolved at compile time and can't load it now, often because its static initializer failed earlier or a transitive dependency is missing.

## You see `NoSuchMethodError` in production though the code compiled. What happened?

The runtime classpath contains a different version of that class than you compiled against, usually because dependency mediation picked an older transitive jar. Find the jar with `mvn dependency:tree` or `java -verbose:class`, then pin the version in `dependencyManagement`.

## Why prefer `-XX:MaxRAMPercentage` over `-Xmx` in a container?

The JVM reads the cgroup memory limit, so a percentage follows whatever limit each environment sets, while a fixed `-Xmx` either wastes memory or gets the container OOM-killed with exit code 137. Leave headroom (around 75% or less) for metaspace, thread stacks, direct buffers and the OS.

## How do you diagnose a Java process pegged at 100% CPU?

`jps -l` for the pid, `top -H -p <pid>` to find the hottest thread, convert its id to hex, and find that `nid` in a `jstack` thread dump to see the code it's running. Take a few dumps seconds apart; a thread stuck in the same frame is the culprit.

## What are the thread states in a thread dump and which is the alarming one?

`RUNNABLE` is working or blocked in native I/O, `WAITING`/`TIMED_WAITING` is parked on a lock, condition or sleep, and `BLOCKED` is waiting for a `synchronized` monitor held by another thread. Many threads `BLOCKED` on one monitor, or many parked in `HikariPool.getConnection`, points straight at the bottleneck.

## Why does JUnit 5 create a new instance of the test class for every test method?

Isolation: instance fields are fresh per test, so tests can't leak state into each other. That's why `@BeforeAll` must be static or you opt into `@TestInstance(PER_CLASS)` for an expensive shared fixture.

## What does Mockito's `UnnecessaryStubbingException` mean and should you suppress it?

The `MockitoExtension` runs with strict stubs, and a `when(...)` you set up was never called, which means the test asserts less than you think or has copy-pasted setup. Fix the test; use `lenient()` only for shared setup that's genuinely optional.

## Mock, spy and fake — when do you use each?

A mock returns defaults until stubbed, for collaborators at the boundary like gateways and repositories. A spy wraps a real object and overrides only stubbed methods, for legacy code. A fake is a real in-memory implementation, best when behaviour matters, like an in-memory repository.

## How do you make a test that depends on the current time deterministic?

Inject `java.time.Clock` into the class and call `Instant.now(clock)`. Tests pass `Clock.fixed(...)`; production passes `Clock.systemUTC()`. The same injection trick covers randomness and id generation.

## What causes flaky tests most often and how do you fix them?

Time, randomness, shared mutable state, async timing and real external resources. Fix with an injected clock or seed, per-test fixtures, `Awaitility` or `verify(mock, timeout())` instead of `Thread.sleep`, and mocks, WireMock or Testcontainers instead of live systems.

## Why is Lombok's `@Data` dangerous on a JPA entity?

It generates `equals`/`hashCode` over every field, including an id that's null until persisted and lazy relations that recurse or trigger loading, and setters on everything. Use `@Getter`, an `@EqualsAndHashCode` on the business key, and explicit behaviour methods.

## Jackson throws "No serializer found for class". What's going on?

The type exposes no properties: private fields with no getters, or a Hibernate lazy proxy. Jackson discovers properties through getters, record components or annotations. Add accessors or, better, map the entity to a DTO record before returning it.

## Why use `log.info("id={}", id)` instead of string concatenation?

The message is only formatted when the level is enabled, so disabled `DEBUG` lines cost nothing, and structured encoders can emit the arguments as separate fields. Passing an exception as the last argument also preserves the stack trace.

## How do you correlate all log lines for one request?

Set a request id in MDC in a servlet filter at the edge, clear it in `finally` because threads are pooled, and include `%X{requestId}` in the pattern. Return it in a response header and forward it on outbound calls; Micrometer Tracing automates this with trace and span ids.

## Why split a Boot jar into layers in the Docker image?

Docker caches per layer, and dependencies change far less often than your classes. Extracting with `-Djarmode=tools … extract --layers` and copying dependencies before the application layer means a code change pushes a small layer and nodes reuse the rest.

## What should liveness and readiness probes check in a Boot service?

Liveness only the process's own health, never a dependency, or a database outage causes restart loops. Readiness whether this instance can serve traffic, including an in-progress graceful shutdown. Boot's `/actuator/health/liveness` and `/readiness` implement this split.

## What happens when Kubernetes sends `SIGTERM` to a Boot app with graceful shutdown enabled?

Readiness flips to refusing traffic, Tomcat stops accepting connections, in-flight requests get up to `spring.lifecycle.timeout-per-shutdown-phase` to finish, then the context closes and `@PreDestroy` hooks release pools. Keep that timeout under the pod's grace period, and make sure the JVM is PID 1 so it actually receives the signal.
