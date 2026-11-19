---
title: JDK, JARs and the Classpath
order: 2
summary: Compile vs run, javac/java, plain vs fat vs Boot JARs, classloaders in a paragraph, the JVM flags you'll meet, and reading jps/jstack/jmap output.
---

In Node the source is the program. In Java there is a compile step, an artifact, a classpath and a runtime with its own flags — and production incidents are diagnosed with JDK tools rather than `console.log`. Interviewers use this area to check you can actually operate a Java service, not just write one.

## Compile vs run

```bash
javac -d out src/com/acme/App.java     # .java → .class (bytecode), one class per file
java -cp out com.acme.App              # start a JVM, load the class, call main
java src/com/acme/App.java             # Java 11+: compile and run in one go (JEP 330); Java 22+ handles several files
java --version                         # runtime; javac --version for the compiler
```

- The JDK contains the JVM, the compiler and the tools. The JRE (just the runtime) stopped being shipped separately with Java 11; you ship a JDK or a `jlink`-trimmed runtime.
- Bytecode targets a class-file version: compile with `--release 21` to be sure you don't use APIs newer than your deployment JVM. Running class files compiled for a newer release throws `UnsupportedClassVersionError`.
- The JVM JIT-compiles hot bytecode to native code at run time (C1 then C2). That's why Java benchmarks warm up, and why a freshly started service is slower for the first seconds. GraalVM native-image moves this to build time at the cost of reflection configuration (Boot supports it via `spring-boot-starter-parent`'s `native` profile).

Contrast with JS: there is no compile-time type check in JS, so Java fails earlier (at `javac`) for many errors that Node fails on in production. There's also no tree-shaking: everything on the classpath is loadable.

## JAR types

A JAR is a zip with a `META-INF/MANIFEST.MF`. Inspect with `jar tf app.jar` or `unzip -l`.

| Type | Contents | Run with | Built by |
|---|---|---|---|
| Plain jar | your classes + resources only | `java -cp app.jar:lib/* com.acme.App` | `maven-jar-plugin` (default `package`) |
| Fat / uber jar | your classes **and** every dependency's classes unpacked into one jar | `java -jar app.jar` | `maven-shade-plugin` (can relocate packages, merge `META-INF/services`) or `maven-assembly-plugin` `jar-with-dependencies` |
| Spring Boot jar | your classes under `BOOT-INF/classes/`, dependencies as **nested jars** under `BOOT-INF/lib/`, plus Boot's loader classes at the root | `java -jar app.jar` | `spring-boot-maven-plugin:repackage` / Gradle `bootJar` |

```text
app.jar
├── META-INF/MANIFEST.MF        Main-Class: org.springframework.boot.loader.launch.JarLauncher
│                               Start-Class: com.acme.OrdersApplication
├── org/springframework/boot/loader/…
├── BOOT-INF/classes/com/acme/…
├── BOOT-INF/lib/spring-web-6.2.x.jar
└── BOOT-INF/classpath.idx, layers.idx
```

Why Boot nests jars rather than shading: shading breaks signed jars, merges same-named resources unpredictably, and makes it impossible to tell which dependency a class came from. Boot's `JarLauncher` installs a classloader that reads nested jars in place. Cost: a custom launcher, and you can't `-cp` a Boot jar from another app (publish a plain jar for that).

Useful Boot-jar tricks:

```bash
java -jar app.jar --server.port=9090                     # args become Spring properties
java -Djarmode=tools -jar app.jar extract --layers --destination out   # explode into layers (Boot 3.3+)
java -Dloader.path=/ext/lib -cp app.jar org.springframework.boot.loader.launch.PropertiesLauncher   # extra classpath
```

## Classpath and classloaders in a paragraph

The classpath is a list of directories and jars searched **in order** for a class or resource; `-cp` on the command line, `Class-Path:` in a manifest, or Boot's `BOOT-INF/lib`. Classes are loaded lazily on first use by a chain of classloaders: bootstrap (`java.base` and the rest of the JDK), platform, then the application loader, with Boot adding its own on top. Delegation is parent-first: a loader asks its parent before looking itself, so you cannot shadow `java.lang.String`. Three errors encode the whole story: `ClassNotFoundException` means nobody could find it (missing jar); `NoClassDefFoundError` means it was found at compile time but its loading/static-init failed at run time (often a missing transitive dependency, or an earlier exception in a static initializer); `NoSuchMethodError`/`NoSuchFieldError` means the class loaded but from a different version than you compiled against — a classpath conflict, so run `mvn dependency:tree`. The Java Platform Module System (`module-info.java`) adds explicit exports and `requires`; most app code ignores it and lives on the classpath as the "unnamed module".

## JVM flags you will see

| Flag | Meaning |
|---|---|
| `-Xms512m` / `-Xmx2g` | initial / max heap. Objects live here; `OutOfMemoryError: Java heap space` means it filled |
| `-XX:MaxRAMPercentage=75.0` | max heap as a % of the container's memory limit; preferred in containers over `-Xmx` |
| `-Xss1m` | thread stack size; too many platform threads × stack = memory. Virtual threads sidestep this |
| `-XX:+UseG1GC` (default) / `-XX:+UseZGC` / `-XX:+UseParallelGC` | collector choice: G1 balanced, ZGC sub-ms pauses for big heaps, Parallel for throughput batch jobs |
| `-XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/dumps` | write a heap dump when OOM happens; analyse in Eclipse MAT |
| `-XX:+ExitOnOutOfMemoryError` | die so the orchestrator restarts you rather than limping |
| `-Dkey=value` | system property; read with `System.getProperty("key")`. Spring maps `-Dserver.port=8081` to config |
| `-javaagent:otel.jar` | bytecode instrumentation agent (OpenTelemetry, profilers, Mockito inline) |
| `-Xlog:gc*:file=gc.log` | unified GC logging (Java 9+ replaces `-XX:+PrintGCDetails`) |
| `--enable-preview` | needed to run preview features; must match at compile time |
| `-XX:+UseContainerSupport` | on by default since Java 10; makes the JVM read cgroup limits |
| `JAVA_TOOL_OPTIONS="…"` | env var the JVM picks up automatically; the way to inject flags into a container image you don't control |

Environment variables are not system properties: `-Dfoo=bar` is a JVM thing, `FOO=bar` is an OS thing. Spring Boot reads both.

## Reading the JDK tools

```bash
jps -l                         # list JVM pids with main class: "41234 com.acme.OrdersApplication"
jcmd 41234 help                # everything jcmd can do; it supersedes most of the older tools
jstack 41234 > threads.txt     # thread dump (or: jcmd 41234 Thread.print)
jmap -histo:live 41234 | head  # live object histogram by class
jmap -dump:live,format=b,file=heap.hprof 41234
jcmd 41234 GC.heap_info
jstat -gcutil 41234 1000       # GC utilisation every second
```

### A thread dump, decoded

```text
"http-nio-8080-exec-7" #42 daemon prio=5 os_prio=31 cpu=812.11ms elapsed=3011.21s tid=0x… nid=0x6b03 waiting on condition
   java.lang.Thread.State: TIMED_WAITING (parking)
        at jdk.internal.misc.Unsafe.park(Native Method)
        at java.util.concurrent.locks.LockSupport.parkNanos(...)
        at com.zaxxer.hikari.util.ConcurrentBag.borrow(ConcurrentBag.java:151)
        at com.zaxxer.hikari.pool.HikariPool.getConnection(HikariPool.java:180)
        at com.acme.orders.OrderRepository.findById(OrderRepository.java:44)
```

- `http-nio-8080-exec-N` are Tomcat request threads (200 by default). Thirty of them stuck in `HikariPool.getConnection` = connection pool exhausted (pool is 10 by default); fix the slow query or the leak, not the pool size.
- `RUNNABLE` = doing work (or blocked in native I/O, which also shows as RUNNABLE). `BLOCKED` = waiting for a `synchronized` monitor someone else holds (look for `- locked <0x…>` lines in another thread). `WAITING`/`TIMED_WAITING` = parked on a lock, condition, `sleep` or `join`.
- A deadlock is reported explicitly at the bottom: `Found one Java-level deadlock`.
- Take three dumps a few seconds apart; a thread in the same frame all three times is stuck.

### A histogram, decoded

```text
 num     #instances         #bytes  class name
   1:       2,318,409      111,283,632  [B                      (byte[] — usually Strings' backing arrays)
   2:       2,301,222       55,229,328  java.lang.String
   3:         412,000       29,664,000  com.acme.orders.OrderLine
```

Millions of `OrderLine` in a service that should hold a few hundred = something is caching or collecting without bound. Compare two histograms minutes apart; the class that keeps growing is the leak. For the "who holds them" answer you need a heap dump and MAT's dominator tree.

## Worked example: diagnosing `NoSuchMethodError`

A service starts fine but fails on the first request with:

```text
java.lang.NoSuchMethodError: 'com.fasterxml.jackson.core.JsonParser
    com.fasterxml.jackson.databind.ObjectMapper.createParser(java.io.Reader)'
```

The code **compiled**, so the method existed at compile time. At runtime a **different version** of the library is on the classpath. Steps:

1. Find which JAR the class came from at runtime: run with `-verbose:class` (or `-Xlog:class+load`) and search for `ObjectMapper`, or log `ObjectMapper.class.getProtectionDomain().getCodeSource().getLocation()`.
2. Find why that version won: `mvn dependency:tree -Dverbose -Dincludes=com.fasterxml.jackson.core` shows every path that brings Jackson in and which version Maven's "nearest wins" rule picked.
3. Fix it by aligning versions: import the library's BOM (`jackson-bom`) in `dependencyManagement`, or exclude the transitive dependency that drags in the old version.
4. Prevent recurrence with the Maven Enforcer plugin's `dependencyConvergence` rule, which fails the build when versions conflict.

The related errors, and what they usually mean:

| Error | Typical cause |
| --- | --- |
| `ClassNotFoundException` | A class loaded by name (reflection, `Class.forName`) isn't on the classpath |
| `NoClassDefFoundError` | The class was present at compile time but is missing at runtime, or its static initialiser failed earlier |
| `NoSuchMethodError` / `NoSuchFieldError` | Version mismatch between compile time and runtime |
| `IncompatibleClassChangeError` | A class changed between versions (class became interface, static became instance) |
| `UnsupportedClassVersionError` | Compiled for a newer Java than the runtime (class file version 69 = Java 25) |

## Common interview questions

**What is the difference between the JDK, JRE and JVM?**
The JVM executes bytecode; the JRE was the JVM plus the class library for running apps; the JDK adds the compiler and tools. Since Java 11 only the JDK is distributed, and `jlink` builds a custom minimal runtime if you want one.

**How does `java -jar app.jar` know what to run?**
From `Main-Class` in `META-INF/MANIFEST.MF`. For a Boot jar that's `JarLauncher`, which sets up a classloader for `BOOT-INF/lib` and then invokes the `Start-Class`, your `@SpringBootApplication` class.

**`ClassNotFoundException` vs `NoClassDefFoundError`?**
The first is a checked exception from an explicit lookup (`Class.forName`, a classloader) — the class simply isn't on the classpath. The second is an `Error` thrown when the JVM needs a class it resolved at compile time and can't load it now, commonly because its static initializer threw earlier or a transitive dependency is missing.

**You get `NoSuchMethodError` in production but it compiled fine. What happened?**
A different version of the class is on the runtime classpath than the one you compiled against — a dependency conflict resolved to an older jar. `mvn dependency:tree` or `java -verbose:class` to see which jar supplied it, then pin the version.

**Why prefer `-XX:MaxRAMPercentage` over `-Xmx` in Kubernetes?**
The pod's memory limit may change per environment; a percentage follows it, a fixed `-Xmx` either wastes memory or gets the pod OOM-killed. Leave headroom (75% or less) for metaspace, thread stacks, direct buffers and the OS.

**A service is at 100% CPU. First three commands?**
`jps -l` to find the pid, `top -H -p <pid>` to find the hot native thread id, convert it to hex and find that `nid` in a `jstack` dump to see what code it's running. For memory, swap `jstack` for `jmap -histo:live`.

**What is JIT and why does it matter for benchmarks?**
HotSpot interprets bytecode first and compiles hot methods to native code as it learns their profile. The first requests are slower, which is why you warm up before measuring (JMH exists for this) and why serverless Java cold starts hurt — hence CRaC and GraalVM native images.

## Pitfalls

- Setting `-Xmx` larger than the container limit. The JVM happily tries to use it and the kernel kills the process; there's no `OutOfMemoryError`, just exit code 137.
- Reading `RUNNABLE` as "busy": a thread blocked in a socket read is also `RUNNABLE`.
- Shading a library that has `META-INF/services` files without a transformer: service loading silently picks one provider.
- Compiling with a newer JDK than production without `--release`; it works locally and dies with `UnsupportedClassVersionError` on deploy.

## Key takeaways

- `javac` compiles to bytecode; `java` runs it on the JVM using a classpath (or module path).
- Classes are loaded lazily through delegating class loaders.
- Most runtime linkage errors are version conflicts: inspect with `dependency:tree`, fix with BOMs and exclusions.
- Know the JDK tools: `jcmd`, `jstack`, `jmap`, `jfr`, `jdeps`, `jlink`.
- Match the compile target (`--release`) to the runtime version.
