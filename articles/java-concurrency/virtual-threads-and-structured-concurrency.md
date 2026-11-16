---
title: Virtual Threads and Structured Concurrency
order: 5
summary: What Java 21 virtual threads fix, how they are scheduled, pinning and the synchronized caveat, when they do not help, the executor to use, structured concurrency in a paragraph, and the answer to "do we still need reactive?".
---

Virtual threads (JEP 444, final in Java 21) are the most asked "modern Java" topic right now. Interviewers want to hear that you understand *why* they exist (thread-per-request without the thread cost), *how* they work (mounted on a small pool of carrier threads, unmounted on blocking), and *when they do not help* (CPU-bound work, pinning).

## What they fix

Classic servlet model: one platform thread per request. A platform thread is an OS thread with about 1 MB of stack reserved, expensive to create and context-switch, so a server tops out at a few thousand concurrent requests even though most of them are just waiting on a database. The alternatives were pools (limit concurrency, queue the rest) or reactive/async (give up the straightforward blocking style and the readable stack trace).

A virtual thread is a `Thread` whose stack lives on the heap as a small, growable object. The JVM runs it by *mounting* it on a carrier thread from a `ForkJoinPool` sized to the number of cores. When the virtual thread blocks on I/O, a lock, `sleep`, or a `BlockingQueue`, the JVM *unmounts* it, saves its stack, and the carrier picks up another virtual thread. Millions can exist; the cost per thread is roughly its live stack frames.

```java
Thread vt = Thread.ofVirtual().name("req-", 0).start(() -> handle(request));
Thread.startVirtualThread(() -> ...);

try (ExecutorService ex = Executors.newVirtualThreadPerTaskExecutor()) {
    List<Future<Quote>> quotes = ex.invokeAll(tasks);   // one virtual thread per task
}   // close() waits for all

// Spring Boot 3.2+: Tomcat and @Async on virtual threads
// spring.threads.virtual.enabled=true
```

You write the same blocking code (`jdbc.query(...)`, `httpClient.send(...)`) and get async-level scalability.

| | Platform thread | Virtual thread |
|---|---|---|
| Backed by | One OS thread | A heap object, mounted on a carrier while running |
| Stack | Fixed reservation (~1 MB), native | Grows and shrinks on the heap, as big as the live frames |
| Create cost | Microseconds to milliseconds, syscall | Under a microsecond, no syscall |
| Practical count | Thousands | Millions |
| Blocking I/O | Blocks the OS thread | Unmounts; carrier runs something else |
| Scheduled by | The OS | A JDK `ForkJoinPool` (FIFO, work-stealing), sized to cores |
| Pool it? | Yes | No, one per task |
| Daemon | Configurable | Always |

## Backpressure still has to come from somewhere

A pool used to limit concurrency as a side effect. With a thread per task, limit it explicitly where the resource is:

```java
private final Semaphore dbSlots = new Semaphore(20);     // match the connection pool

Row load(long id) throws InterruptedException {
    dbSlots.acquire();
    try { return jdbc.queryOne(id); }
    finally { dbSlots.release(); }
}
```

Without this, ten thousand virtual threads queue inside the connection pool, timeouts fire in bulk, and the "scalability" shows up as a thundering herd.

## How to think about them

- They are not faster: a request takes the same time. They are *cheaper to have waiting*, so throughput under high concurrency rises and you stop sizing pools.
- Do not pool them. Creating one is cheap; a pool of virtual threads is a contradiction. `newVirtualThreadPerTaskExecutor` is the idiom.
- They are always daemon threads with normal priority; `setDaemon(false)` throws.
- Blocking calls inside the JDK (sockets, files, `Thread.sleep`, `Lock`, `BlockingQueue`, `Future.get`) were reworked to unmount. File I/O still occupies a carrier because the OS has no non-blocking file API, so the JVM temporarily compensates by adding carriers.
- `ThreadLocal` works but is a poor fit: with a million threads a `ThreadLocal` cache becomes a million caches. Use `ScopedValue` (preview in 21, final in 25) for per-request context.
- Thread dumps: `jcmd <pid> Thread.dump_to_file -format=json dump.json` includes virtual threads; the classic `jstack` does not.

## Pinning

A virtual thread is *pinned* when it blocks while it cannot be unmounted, so it holds the carrier hostage. On Java 21 the two causes are:

1. Blocking inside a `synchronized` block or method (or while waiting on a monitor via `Object.wait`). JEP 491 removed this limitation in JDK 24.
2. Blocking inside a native frame (JNI, or a foreign function call).

Pinning does not break correctness, but if many virtual threads pin, the carrier pool is exhausted and you are back to platform-thread scaling, or worse, deadlocked when every carrier is pinned waiting for a lock held by an unmounted thread.

```java
// Java 21 advice: for lock held across blocking I/O, prefer ReentrantLock
private final ReentrantLock lock = new ReentrantLock();
void refresh() {
    lock.lock();
    try { cache = client.fetch(); }   // unmounts cleanly while waiting
    finally { lock.unlock(); }
}
```

Diagnose with `-Djdk.tracePinnedThreads=full` (JDK 21 to 23) or the `jdk.VirtualThreadPinned` JFR event. Short `synchronized` sections that do not block inside are fine on any version.

## When they do not help

- CPU-bound work: there are still only N cores. A virtual thread doing a 200 ms computation occupies a carrier for 200 ms. Use a bounded platform pool sized to cores.
- Code that already runs on a fixed thread model (Netty event loops, Kafka consumers with their own threads).
- Workloads dominated by one shared bounded resource. A million virtual threads hitting a 20-connection pool just wait in the pool's queue; the bottleneck moved, and you need a `Semaphore` or the pool's own limit as explicit backpressure.
- Old JDBC drivers or libraries that use `synchronized` around socket I/O (most have been fixed; check).
- Latency-critical paths where the unmount/mount cost (microseconds) matters, which is rare.

## Structured concurrency in a paragraph

`StructuredTaskScope` (JEP 453, preview in 21; the API was reshaped in later previews and is still a preview feature in Java 25) treats a group of subtasks as a unit with the same lifetime as the code block that started them: you fork subtasks inside a try-with-resources scope, `join()` the scope, and when the block exits every subtask is guaranteed finished or cancelled. The two built-in policies on 21 are `ShutdownOnFailure` (fail the whole scope on the first exception, cancel the siblings, like `Promise.all`) and `ShutdownOnSuccess` (take the first result, cancel the rest, like `Promise.any`). Cancellation propagates down the tree via interruption, exceptions propagate up with the subtask's stack, and thread dumps show the tree. It fixes the two problems of unstructured `ExecutorService`/`CompletableFuture` code: leaked tasks that outlive the request, and failures in one branch leaving the others running.

```java
// Java 21 preview API (--enable-preview)
try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
    Subtask<User>  user  = scope.fork(() -> users.find(id));
    Subtask<Order> order = scope.fork(() -> orders.find(id));
    scope.join().throwIfFailed();                 // wait for both, rethrow first failure
    return new Profile(user.get(), order.get());
}   // both subtasks are done or cancelled here
```

## "Do we still need reactive?"

The interview answer, in order:

1. Reactive (WebFlux, Reactor, RxJava) existed to get high concurrency without a thread per request, at the cost of a different programming model: no blocking, operator chains, hard debugging, viral `Mono`/`Flux` types.
2. Virtual threads deliver the same scalability goal with ordinary blocking code, readable stack traces, standard exceptions and debuggers that work. For the typical request/response service that calls a database and a few HTTP APIs, Boot 3.2+ on virtual threads is the simpler choice.
3. Reactive still earns its place for *streaming* semantics: backpressure over unbounded streams, event-driven pipelines, server-sent events, composing many signals with time-based operators. The Flow API and Reactive Streams interfaces are not going away.
4. Caveat: virtual threads need the libraries beneath you to block cooperatively (JDBC drivers, HTTP clients are fine; `synchronized`-heavy code on JDK 21 is not), and backpressure must be made explicit with semaphores or bounded queues rather than coming for free.

## Common interview questions

**What is a virtual thread and how is it different from a platform thread?** A virtual thread is a JDK-managed thread whose stack lives on the heap and which is mounted on a small pool of carrier OS threads only while running. Blocking unmounts it so the carrier can run another. Platform threads map one-to-one to OS threads with a fixed large stack and are expensive to create and keep.

**Do virtual threads make my code faster?** No. They let far more threads wait concurrently at low memory cost, raising throughput for I/O-bound workloads. CPU-bound work is limited by cores exactly as before.

**What is pinning?** A virtual thread blocking in a state where it cannot unmount, so it holds its carrier: inside `synchronized` (on JDK 21 to 23) or in a native frame. Fix by using `ReentrantLock` for locks held across blocking calls, or upgrade to JDK 24+ where `synchronized` no longer pins.

**Should I pool virtual threads?** No. They are cheap and disposable; create one per task with `Executors.newVirtualThreadPerTaskExecutor()`. If you need to limit concurrency against a resource, use a `Semaphore`, not a pool.

**How do virtual threads interact with `ThreadLocal`?** They support it, but each of potentially millions of threads gets its own copy, so caching via `ThreadLocal` wastes memory. Use `ScopedValue` for request-scoped context passing.

**What is structured concurrency?** Confining the lifetime of concurrent subtasks to a lexical scope: fork inside a `StructuredTaskScope`, join, and the block cannot exit while subtasks are running. Failure in one cancels the siblings and propagates; no leaked tasks, and thread dumps show the hierarchy.

**Is reactive programming obsolete with virtual threads?** For typical request/response services, blocking code on virtual threads is now simpler and scales similarly. Reactive remains the right tool for streaming data with backpressure and event-driven composition. Choose per workload, not per fashion.

**Why is `synchronized` a problem with virtual threads on Java 21?** The monitor implementation pinned the carrier, so a virtual thread blocking inside `synchronized` could not unmount. Heavy use could exhaust carriers or deadlock. JDK 24 reimplemented monitors to unmount correctly.
