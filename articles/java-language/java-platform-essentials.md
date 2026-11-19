---
title: Java Platform Essentials
order: 8
summary: JDK vs JRE vs JVM, versions and LTS, what changed from 8 to 21 that interviewers actually ask, java.time, modules in a paragraph, jshell, and how to read a stack trace.
---

A screening round often opens with "which Java version do you use and what's new in it". This article is the set of facts to have ready, plus the platform tools you will be expected to know exist.

## JDK, JRE, JVM

| | Contains | You use it to |
|---|---|---|
| JVM | Bytecode interpreter, JIT compilers (C1, C2), garbage collectors, class loader | Run `.class` files |
| JRE | JVM + standard library (`java.base` and friends) | Run applications (no longer shipped separately since 11) |
| JDK | JRE + `javac`, `jshell`, `jar`, `javadoc`, `jlink`, `jcmd`, `jstack`, `jmap`, JFR | Build and diagnose |

Distributions: Oracle JDK (commercial support), Eclipse Temurin (Adoptium), Amazon Corretto, Azul Zulu, Microsoft, Red Hat. All build from the same OpenJDK source; pick by support policy, not by features.

## Versions and LTS

Release cadence is six months (March, September); LTS every two years since 17.

| Version | Released | Status |
|---|---|---|
| 8 | 2014 | LTS, still common in legacy; no modules, no `var` |
| 11 | 2018 | LTS, the first post-module LTS |
| 17 | 2021 | LTS, baseline for Spring Boot 3 |
| 21 | 2023 | LTS, current mainstream target: virtual threads, pattern matching |
| 25 | 2025 | LTS, baseline for Spring Boot 4 |

Say "we target 21" and be able to explain why: virtual threads, sequenced collections, record patterns and switch patterns final, and it is the Spring Boot 3.x sweet spot.

## What changed, by version

### 8 (2014)

Lambdas and method references, `java.util.function`, Streams, `Optional`, default methods on interfaces, `java.time`, `CompletableFuture`, Nashorn (removed later), `PermGen` replaced by Metaspace.

### 9 to 11

- 9: module system (JPMS), `jshell`, `List.of`/`Map.of` factories, private interface methods, `Stream.takeWhile`/`dropWhile`, `Optional.ifPresentOrElse`, multi-release jars, G1 as default GC.
- 10: `var` for locals, `List.copyOf`, `Collectors.toUnmodifiableList`.
- 11: `HttpClient` (standard), `String.isBlank`/`strip`/`lines`/`repeat`, `Files.readString`/`writeString`, `var` in lambda parameters, `java` launcher runs a single source file, Java EE modules (JAXB, JAX-WS) removed from the JDK, `Optional.isEmpty`.

### 12 to 17

- 14: switch expressions, helpful `NullPointerException` messages, records preview.
- 15: text blocks, hidden classes, ZGC and Shenandoah production-ready.
- 16: records final, pattern matching for `instanceof` final, `Stream.toList()`, `mapMulti`, strong encapsulation of JDK internals by default.
- 17: sealed classes final, pattern matching for switch preview, `RandomGenerator` API, removal of the experimental AOT/JIT compiler, applets deprecated for removal.

### 18 to 21

- 18: UTF-8 as default charset, simple web server (`jwebserver`), `@snippet` in Javadoc.
- 19/20: virtual threads and structured concurrency previews.
- 21: virtual threads final, pattern matching for switch and record patterns final, sequenced collections (`getFirst`, `getLast`, `reversed`, `addFirst` on `List`, `Deque`, `LinkedHashMap`/`LinkedHashSet`), generational ZGC, `String.indexOf(ch, from, to)`, `StringBuilder.repeat`, `Math.clamp`, unnamed patterns and classes preview, key encapsulation API.

### After 21

- 22: unnamed variables and patterns (`_`) final, multi-file source launch, foreign function and memory API final, statements before `super(...)` preview.
- 23/24: primitive types in patterns preview, Markdown Javadoc, stream gatherers and the class-file API final (24), `SecurityManager` permanently disabled (24).
- 25 (LTS): compact source files and instance `main`, flexible constructor bodies (statements before `super(...)`), module import declarations, scoped values final, structured concurrency still preview.

The honest line for an interview: "the features I use daily arrived in 8 (lambdas/streams), 10 (`var`), 16 (records), 17 (sealed), 21 (virtual threads and pattern matching)".

## `java.time`

`java.util.Date` and `Calendar` are mutable, zero-indexed months, and not thread-safe; use `java.time` (JSR-310, Java 8), which is immutable and explicit about time zones.

| Type | Represents | Example |
|---|---|---|
| `Instant` | A point on the UTC timeline | Timestamps in logs and databases |
| `LocalDate` / `LocalTime` / `LocalDateTime` | Calendar date/time with no zone | Birthdays, business hours |
| `ZonedDateTime` | Date-time in a specific `ZoneId` | Scheduling a meeting in `Asia/Kolkata` |
| `OffsetDateTime` | Date-time with a fixed UTC offset | ISO-8601 in APIs, JDBC `TIMESTAMP WITH TIME ZONE` |
| `Duration` | Time-based amount (seconds, nanos) | Timeouts |
| `Period` | Date-based amount (years, months, days) | "30 days from now" |
| `DateTimeFormatter` | Parsing and formatting, thread-safe | `ISO_INSTANT`, `ofPattern("dd/MM/yyyy")` |

```java
Instant now = Instant.now();
ZonedDateTime ist = now.atZone(ZoneId.of("Asia/Kolkata"));
LocalDate due = LocalDate.now().plus(Period.ofDays(30));
Duration ttl = Duration.ofMinutes(15);
String iso = DateTimeFormatter.ISO_INSTANT.format(now);
LocalDate d = LocalDate.parse("2025-01-31");
d.plusMonths(1);                        // 2025-02-28, clamps to the last valid day
```

Rules: store and transmit `Instant` or ISO-8601 strings with offset; convert to a zone only for display; inject a `Clock` for testability (`Instant.now(clock)`); `yyyy` is year-of-era and `YYYY` is week-based year — a classic bug on the last days of December.

## Modules in one paragraph

JPMS (Java 9) adds `module-info.java` declaring what a jar `requires` and which packages it `exports`; everything not exported is inaccessible even via reflection, which is why the JDK's own internals (`sun.misc.Unsafe`, `jdk.internal.*`) stopped being reachable and why some old libraries needed `--add-opens`. The JDK itself is modular, enabling `jlink` to build a trimmed runtime image. Most applications still run on the classpath as the "unnamed module" and that is fine; you need to know the vocabulary (`requires`, `exports`, `opens`, `--add-opens`) and that Spring Boot apps generally do not ship a `module-info`.

## Tooling you should recognise

- `jshell`: the REPL. `jshell> var xs = List.of(1,2); xs.stream().mapToInt(i -> i).sum()`. Use it to verify a snippet before claiming its output in an interview.
- `java -version` versus `javac -version`; `JAVA_HOME`; SDKMAN or `jenv` to switch versions.
- `jar` to package, `jlink` to make a custom runtime, `jpackage` for native installers.
- Diagnostics: `jcmd <pid> Thread.print` or `jstack` for thread dumps, `jmap -histo` for heap histograms, Java Flight Recorder (`-XX:StartFlightRecording`) with JDK Mission Control for profiling. Spring Actuator exposes `threaddump` and `heapdump` over HTTP.
- `-Xmx`/`-Xms` for heap size, `-XX:+UseZGC` / `-XX:+UseG1GC` to pick a collector, `-XX:+HeapDumpOnOutOfMemoryError`.

## `var` recap

Local variables only, with an initializer, not `null`, not for fields, parameters or return types; the inferred type is fixed. Allowed in for-loops, try-with-resources and lambda parameters (`(var x, var y) -> ...`, useful only for annotations). Reassignment is allowed, unlike `const`, so pair it with `final` if you want immutability.

## Reading a stack trace

```text
Exception in thread "http-nio-8080-exec-3" org.springframework.dao.DataIntegrityViolationException: could not execute statement
    at org.springframework.orm.jpa.vendor.HibernateJpaDialect.convertHibernateAccessException(HibernateJpaDialect.java:290)
    at ...
    at com.acme.orders.OrderService.place(OrderService.java:71)        <- first frame in your code
    at com.acme.orders.OrderController.create(OrderController.java:39)
    at jdk.internal.reflect.DirectMethodHandleAccessor.invoke(DirectMethodHandleAccessor.java:103)
    ... 112 more
Caused by: org.hibernate.exception.ConstraintViolationException: could not execute statement
    ... 98 more
Caused by: org.postgresql.util.PSQLException: ERROR: duplicate key value violates unique constraint "orders_ref_key"
    at org.postgresql.core.v3.QueryExecutorImpl.receiveErrorResponse(QueryExecutorImpl.java:2725)
```

1. The thread name tells you where it happened (request thread, scheduler, `main`).
2. The first line is the outermost wrapper; the last `Caused by:` is the root cause and usually the actual message you want.
3. Find the first frame in your own packages for the line to open.
4. `... n more` means those frames are identical to the enclosing trace.
5. Suppressed exceptions (from try-with-resources) print as `Suppressed:` blocks.
6. A trace with no frames at all is usually the JIT's fast-throw optimisation; rerun with `-XX:-OmitStackTraceInFastThrow`.

## What happens when you run a Java program

```
Main.java ──javac──▶ Main.class (bytecode) ──java──▶ JVM
                                                     ├─ class loading (bootstrap → platform → application loaders)
                                                     ├─ verification (bytecode is type-safe)
                                                     ├─ interpretation, profiling
                                                     └─ JIT compilation of hot methods (C1, then C2) to machine code
```

1. **Compilation.** `javac` turns source into platform-independent bytecode.
2. **Class loading.** Classes are loaded lazily, the first time they're used, through a hierarchy of class loaders that delegate to their parent first.
3. **Verification and linking.** The JVM checks the bytecode can't break type safety, then resolves references and runs static initialisers.
4. **Execution.** The interpreter starts running bytecode immediately while profiling which methods are hot.
5. **JIT compilation.** Hot methods are compiled to native code, first quickly (C1), then with aggressive optimisations based on the profile (C2): inlining, escape analysis, loop unrolling.

This is why Java services "warm up": the first requests run interpreted code, and performance improves as the JIT compiles hot paths. Techniques to reduce warm-up include class data sharing (CDS), ahead-of-time caches (Project Leyden work in recent JDKs) and GraalVM native images (compiled ahead of time, fast start-up, some reflection limits).

## Memory areas

| Area | Holds | Shared? |
| --- | --- | --- |
| Heap | All objects and arrays | Shared by all threads, managed by the garbage collector |
| Stack (one per thread) | Frames with local variables and partial results | Private to the thread |
| Metaspace | Class metadata | Shared; outside the heap |
| Code cache | JIT-compiled native code | Shared |

A `StackOverflowError` means one thread's stack is exhausted (usually runaway recursion). An `OutOfMemoryError: Java heap space` means live objects don't fit in the heap; `Metaspace` variants point at class-loading leaks.

## Garbage collectors in one table

| Collector | Goal | Typical use |
| --- | --- | --- |
| G1 (default) | Balance throughput and pause times | General-purpose services |
| ZGC | Pauses under a millisecond, very large heaps | Latency-sensitive services |
| Shenandoah | Low pauses, concurrent compaction | Similar to ZGC |
| Parallel | Maximum throughput, longer pauses | Batch jobs |
| Serial | Small heaps, single core | Tiny containers, tools |

Container-aware defaults matter: the JVM reads the container's memory and CPU limits; set `-XX:MaxRAMPercentage` rather than a fixed `-Xmx` so heap size scales with the container.

## Virtual threads in brief

Since Java 21, virtual threads are cheap threads scheduled by the JVM on a small pool of carrier threads. A blocking call (I/O, `sleep`, a lock wait) unmounts the virtual thread instead of blocking an OS thread, so a server can run one thread per request even with hundreds of thousands of concurrent requests:

```java
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    for (Request r : requests) {
        executor.submit(() -> handle(r)); // blocking code, written simply, scales
    }
}
```

They make thread-per-request code scale without reactive frameworks. They don't make CPU-bound work faster. See the concurrency track for details.

## Common interview questions

**What is the difference between JDK, JRE and JVM?**
The JVM executes bytecode and provides GC and JIT. The JRE is the JVM plus the class library. The JDK is the JRE plus development tools like `javac` and `jshell`. Since Java 11 only the JDK is distributed, with `jlink` to produce a minimal runtime.

**Which Java version are you using and what's new in it?**
Target 21 and name the features you use: virtual threads for high-concurrency I/O, pattern matching for switch and record patterns for sealed hierarchies, sequenced collections, and generational ZGC. Mention 17 as the Spring Boot 3 baseline and that 25 is the next LTS.

**Why are Java releases every six months but companies stay on LTS?**
Non-LTS releases get updates only until the next release, so running them means upgrading twice a year. LTS versions receive security patches for years from vendors, which is what production and compliance need. Features ship as previews in interim releases and finalise in time for the LTS.

**What is the difference between `Instant`, `LocalDateTime` and `ZonedDateTime`?**
`Instant` is an absolute UTC timestamp. `LocalDateTime` has no zone at all, so it cannot be converted to an instant without one. `ZonedDateTime` is an instant plus a zone with DST rules. Store `Instant`, compute in `ZonedDateTime` when calendar rules matter, use `LocalDate` for dates without time.

**Why was `java.util.Date` replaced?**
Mutable, no time-zone model, months starting at zero, `Date` representing an instant despite its name, and `SimpleDateFormat` not being thread-safe. `java.time` is immutable, explicit about zones, and its formatters are safe to share.

**What are modules and do you use them?**
JPMS lets a jar declare its dependencies and exported packages so internals are enforced-private. The JDK is modular; most applications are not and run on the classpath. The practical impact is `--add-opens` flags for libraries that reflect into JDK internals.

**How does the JVM run code fast if it is interpreted?**
It starts interpreting bytecode, profiles hot methods, and the JIT (C1 quickly, then C2 with aggressive optimisations like inlining and escape analysis) compiles them to native code. That is why benchmarks need warm-up and why long-running servers get faster after startup.

**What is Metaspace?**
The native-memory area that holds class metadata since Java 8, replacing PermGen. It grows dynamically and is bounded by `-XX:MaxMetaspaceSize`; leaks there come from class loaders that are never unloaded, typical of hot redeploys.

## Pitfalls

- Confusing JDK (tools plus runtime), JRE (runtime) and JVM (the virtual machine).
- Benchmarking without warm-up; use JMH for micro-benchmarks.
- Fixed heap sizes in containers that ignore the container limit.
- Using `java.util.Date` and `Calendar` in new code instead of `java.time`.
- Ignoring LTS versions when choosing a production JDK.

## Key takeaways

- Source compiles to bytecode; the JVM loads, verifies, interprets and JIT-compiles it.
- Java services warm up as hot code gets compiled; native images and caches trade flexibility for start-up speed.
- Objects live on the shared heap; each thread has its own stack.
- G1 is the default collector; ZGC targets very low pauses.
- Use LTS releases, `java.time` for dates, and virtual threads for high-concurrency blocking I/O.
