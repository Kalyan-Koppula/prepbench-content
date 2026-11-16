---
title: Threads, Executors and Pools
order: 1
summary: Thread, Runnable, Callable and Future; why you always go through an ExecutorService; pool types and sizing for CPU vs IO work; queue and rejection choices; correct shutdown; daemon threads and ThreadLocal.
---

JavaScript gave you one thread and an event loop; Java gives you real OS threads and expects you to manage them. Interviewers start with "how do you run something in the background" and quickly get to "how big should the pool be" and "what happens when the queue fills up". The right answers are all about `ExecutorService`, never raw `Thread`.

## The primitives

```java
Runnable task = () -> System.out.println("no result, no checked exception");
Callable<Integer> job = () -> { Thread.sleep(100); return 42; };   // returns a value, may throw

Thread t = new Thread(task, "worker-1");
t.start();            // not t.run(): run() executes on the current thread
t.join();             // block until it finishes
```

- `Runnable.run()` returns nothing and cannot throw checked exceptions; `Callable.call()` returns `V` and can throw.
- `Future<V>` is the handle for an asynchronous result: `get()` blocks (optionally with a timeout and `TimeoutException`), `cancel(mayInterrupt)`, `isDone()`. Exceptions thrown by the task come out of `get()` wrapped in `ExecutionException`.
- A `Thread` costs roughly 1 MB of reserved stack and an OS thread; creating one per request is the classic way to hit `unable to create native thread`. Hence pools.
- Interruption is cooperative. `t.interrupt()` sets a flag; blocking methods (`sleep`, `wait`, `BlockingQueue.take`, `Future.get`) throw `InterruptedException` and clear the flag; CPU loops must check `Thread.currentThread().isInterrupted()`. When you catch `InterruptedException` and cannot rethrow, restore the flag: `Thread.currentThread().interrupt()`.

## `ExecutorService`

```java
ExecutorService pool = Executors.newFixedThreadPool(8);
Future<Integer> f = pool.submit(job);          // Callable → Future<Integer>
pool.execute(task);                            // Runnable, fire-and-forget; exceptions go to the thread's handler
Integer v = f.get(2, TimeUnit.SECONDS);

List<Future<Integer>> all = pool.invokeAll(List.of(job, job));   // waits for every task
Integer first = pool.invokeAny(List.of(job, job));              // first successful result, cancels the rest
```

Why always an executor: it decouples *what* runs from *how many threads* run it, bounds resource use, reuses threads, gives you `Future`s, and is the only sane shutdown story. Catching an exception from `submit` requires calling `get()`; a task that throws inside `submit` and is never `get()`-ed fails silently. Log in the task or use `execute` with an `UncaughtExceptionHandler` on the thread factory.

## Pool types

| Factory | Threads | Queue | Use |
|---|---|---|---|
| `newFixedThreadPool(n)` | Exactly n | Unbounded `LinkedBlockingQueue` | Default for CPU-bound and bounded-IO work; beware the queue growing without limit |
| `newCachedThreadPool()` | 0 to unbounded, idle 60 s | `SynchronousQueue` (hand-off) | Many short tasks; dangerous under load because it creates a thread per queued task |
| `newSingleThreadExecutor()` | 1 | Unbounded | Serialise tasks, e.g. a writer thread |
| `newScheduledThreadPool(n)` | n | Delay queue | `schedule`, `scheduleAtFixedRate`, `scheduleWithFixedDelay` |
| `newWorkStealingPool()` | parallelism = cores | Per-thread deques | `ForkJoinPool` for recursive divide-and-conquer |
| `newVirtualThreadPerTaskExecutor()` (21) | One virtual thread per task | None | IO-bound work at scale; see the virtual-threads article |

All the classic factories build a `ThreadPoolExecutor`. In production you construct it yourself so every parameter is explicit:

```java
ThreadPoolExecutor pool = new ThreadPoolExecutor(
    4,                                  // corePoolSize: kept alive even when idle
    16,                                 // maximumPoolSize: only reached when the queue is full
    60, TimeUnit.SECONDS,               // keepAlive for threads above core
    new ArrayBlockingQueue<>(1_000),    // bounded queue
    Thread.ofPlatform().name("api-", 0).factory(),
    new ThreadPoolExecutor.CallerRunsPolicy());
```

The ordering rule that surprises everyone: a new task goes to a core thread if one is free, otherwise into the *queue*, and only when the queue is full does the pool create threads up to `maximumPoolSize`. With an unbounded queue `maximumPoolSize` is never used.

## Sizing

- **CPU-bound**: threads ≈ number of cores (`Runtime.getRuntime().availableProcessors()`, which is container-aware), maybe +1. More threads only add context-switch overhead.
- **IO-bound**: threads ≈ cores × (1 + wait time / compute time). A task that spends 90 ms waiting on a database and 10 ms computing can use about 10 threads per core. Or stop guessing and use virtual threads.
- **Mixed**: separate pools per resource (one for the DB, one for the upstream HTTP call) so a slow dependency cannot starve the others. This is the bulkhead pattern.
- Always bound the queue. Unbounded means latency grows until the heap does.

## Queue and rejection choices

| Queue | Behaviour |
|---|---|
| `ArrayBlockingQueue(n)` | Fixed capacity, FIFO, backpressure once full |
| `LinkedBlockingQueue(n)` | Same, linked nodes; unbounded if no capacity given |
| `SynchronousQueue` | No capacity; each submit must find a waiting thread or spawn one |
| `PriorityBlockingQueue` | Ordered by comparator, unbounded |
| `DelayQueue` | Elements become available after a delay |

When the queue is full and the pool is at max, the `RejectedExecutionHandler` decides:

- `AbortPolicy` (default): throw `RejectedExecutionException`. Good: fail fast and let the caller return 503.
- `CallerRunsPolicy`: run the task on the submitting thread. Natural backpressure; slows producers.
- `DiscardPolicy` / `DiscardOldestPolicy`: silently drop. Only for metrics-like work where loss is acceptable.

## Shutting down correctly

```java
pool.shutdown();                               // stop accepting; running and queued tasks finish
if (!pool.awaitTermination(30, TimeUnit.SECONDS)) {
    List<Runnable> dropped = pool.shutdownNow();   // interrupt workers, return queued tasks
    if (!pool.awaitTermination(5, TimeUnit.SECONDS)) log.warn("pool did not terminate");
}

// Java 19+: ExecutorService is AutoCloseable; close() = shutdown + awaitTermination
try (ExecutorService ex = Executors.newFixedThreadPool(4)) {
    ex.submit(task);
}   // blocks here until tasks finish
```

Forgetting shutdown keeps non-daemon worker threads alive and the JVM never exits; it is the number one "my main method hangs" bug. In Spring, pools are beans with `destroyMethod`, so the context handles it.

## Daemon threads

The JVM exits when the last *non-daemon* thread ends. Daemon threads (`t.setDaemon(true)` before `start`, or `Thread.ofPlatform().daemon()`) are killed abruptly at exit with no `finally` blocks run, so they are only for housekeeping like cache eviction or metrics flushing. Executor threads are non-daemon by default; virtual threads are always daemon.

## `ThreadLocal`

Per-thread storage, the Java equivalent of `AsyncLocalStorage`. Used for request context (trace IDs, current user), per-thread caches (`SimpleDateFormat` before `DateTimeFormatter` existed), and transactional state in frameworks.

```java
private static final ThreadLocal<String> REQUEST_ID = new ThreadLocal<>();

void handle(Request r) {
    REQUEST_ID.set(r.id());
    try {
        process();                 // anything on this thread can read REQUEST_ID.get()
    } finally {
        REQUEST_ID.remove();       // mandatory on pooled threads
    }
}
```

Pitfalls: values do not propagate to child threads (`InheritableThreadLocal` copies at creation only), to pool threads, or across `CompletableFuture` stages; forgetting `remove()` leaks and, worse, leaks *another request's* context into yours. Java 21 previews `ScopedValue` as the immutable, structured replacement.

## Common interview questions

**What is the difference between `start()` and `run()`?** `start()` asks the JVM to create a new OS thread that calls `run()`; calling `run()` directly just executes the method on the current thread. Calling `start()` twice throws `IllegalThreadStateException`.

**`Runnable` vs `Callable`?** `Runnable` returns void and cannot throw checked exceptions; `Callable<V>` returns a value and may throw. `submit(Callable)` gives a `Future<V>` whose `get()` rethrows the task's exception wrapped in `ExecutionException`.

**Why use a thread pool instead of creating threads?** Thread creation is expensive (OS thread plus stack), unbounded creation exhausts memory, and raw threads give no queueing, result handling or shutdown. A pool reuses threads, bounds concurrency, and queues excess work with a defined rejection policy.

**How do you size a thread pool?** CPU-bound: about the number of cores. IO-bound: cores times (1 + wait/compute ratio), or just use virtual threads. Then measure; and isolate pools per downstream dependency so one slow service cannot consume all threads.

**What happens when the queue of a `ThreadPoolExecutor` fills up?** The pool grows toward `maximumPoolSize`; once that is reached the `RejectedExecutionHandler` runs. The default throws `RejectedExecutionException`; `CallerRunsPolicy` executes on the caller for backpressure. With an unbounded queue it never fills and max size is irrelevant.

**Why is `Executors.newCachedThreadPool` dangerous?** It has no upper bound on threads: every submit that finds no idle thread creates one. Under a burst you get thousands of threads, memory pressure and context-switch collapse. Use a bounded `ThreadPoolExecutor` or virtual threads.

**How do you stop a running thread?** You cannot kill it; you interrupt it. The task must check `isInterrupted()` or respond to `InterruptedException` from blocking calls, clean up, and exit. `shutdownNow()` on an executor interrupts its workers.

**When should a thread be a daemon?** Only when its work can be abandoned mid-way at JVM exit, such as background cleanup. Anything that writes data or holds resources must be non-daemon and shut down explicitly.
