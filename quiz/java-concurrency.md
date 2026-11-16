---
title: Concurrency and Thread Safety
order: 4
module: java-concurrency
summary: Executors and pool sizing, the memory model, locks and atomics, concurrent collections, CompletableFuture, virtual threads, deadlocks and the thread-safety method.
---

## What is the difference between `Thread.start()` and `Thread.run()`?

`start()` asks the JVM to create a new thread that will invoke `run()`; calling `run()` directly runs the body on the current thread. `start()` twice throws `IllegalThreadStateException`.

## `Runnable` versus `Callable`?

`Runnable.run()` returns nothing and cannot throw checked exceptions. `Callable<V>.call()` returns a value and can throw; submitting one yields a `Future<V>` whose `get()` wraps any exception in `ExecutionException`.

## Why use an `ExecutorService` instead of creating threads?

Threads are expensive (OS thread plus stack) and unbounded creation exhausts memory. A pool reuses threads, caps concurrency, queues excess work with a defined rejection policy, returns `Future`s and gives you a shutdown story.

## How do you size a thread pool?

CPU-bound: about the number of cores. IO-bound: cores times (1 + wait time / compute time), or use virtual threads instead. Isolate pools per downstream dependency so one slow service cannot starve the others, then measure.

## What happens when a `ThreadPoolExecutor`'s queue is full?

The pool grows toward `maximumPoolSize`; once at max, the `RejectedExecutionHandler` runs. The default throws `RejectedExecutionException`; `CallerRunsPolicy` runs the task on the submitter for backpressure. With an unbounded queue, max size is never reached.

## Why is `Executors.newCachedThreadPool` risky in a server?

It has no upper bound on threads: every task that finds no idle thread spawns a new one. A burst creates thousands of threads, exhausting memory and CPU. Use a bounded `ThreadPoolExecutor` or virtual threads.

## How do you shut down an executor correctly?

`shutdown()` to stop accepting work, `awaitTermination(timeout)` to let queued tasks finish, then `shutdownNow()` to interrupt stragglers. Since Java 19 `ExecutorService` is `AutoCloseable` and try-with-resources does this.

## How do you stop a running thread in Java?

You cannot kill it; you `interrupt()` it. Blocking calls throw `InterruptedException`, CPU loops must poll `isInterrupted()`, and the task cleans up and exits. If you catch the exception without rethrowing, restore the flag with `Thread.currentThread().interrupt()`.

## What is happens-before?

The Java Memory Model's visibility rule: if A happens-before B, A's writes are visible to B. Program order, monitor unlock then lock, volatile write then read, thread start and join, and executor hand-offs create it, and it is transitive.

## What does `volatile` guarantee?

Every read sees the most recent write from any thread, and operations cannot be reordered across the volatile access. It does not make compound operations such as `count++` atomic and provides no mutual exclusion.

## Why does `volatile int count; count++` still lose updates?

Because `++` is read, add, write: two threads can both read 5 and both write 6. `volatile` fixes visibility, not atomicity. Use `AtomicInteger.incrementAndGet()` or a lock.

## Why was double-checked locking broken without `volatile`?

`instance = new Config()` can be reordered so the reference is published before the constructor finishes. A second thread sees a non-null reference to a half-built object and skips the lock. `volatile` forbids the reordering; the holder-class idiom avoids the problem entirely.

## Is `synchronized` reentrant, and why does it matter?

Yes: the owning thread can re-enter the same monitor and a count tracks depth. Without reentrancy a synchronized method calling another synchronized method on the same object would deadlock itself.

## If the setter is `synchronized`, must the getter be too?

Yes. A one-sided lock creates no happens-before edge, so the getter may read a stale value forever. Synchronise both, or make the field `volatile` if it is a single independent value.

## What is safe publication?

Making a new object visible to other threads such that they see it fully constructed: static initialiser, `volatile` or atomic field, `final` field, a lock, or hand-off through a concurrent collection or executor. A plain field write is not safe.

## What guarantee do `final` fields give in the memory model?

Once the constructor completes without leaking `this`, every thread that gets the reference sees the `final` fields correctly initialised with no synchronisation. This is why properly built immutable objects are thread-safe to share.

## When would you pick `ReentrantLock` over `synchronized`?

When you need `tryLock` with a timeout, interruptible acquisition, fairness, multiple `Condition`s, a lock held across method boundaries, or non-pinning behaviour on Java 21 virtual threads. Otherwise `synchronized` is simpler and auto-releases.

## How does compare-and-swap work?

CAS atomically sets a variable to a new value only if it still holds the expected value, as one CPU instruction. `AtomicInteger.incrementAndGet` loops read-compute-CAS until it succeeds; no thread ever blocks.

## When is `LongAdder` better than `AtomicLong`?

For write-heavy counters under contention: `LongAdder` spreads increments across per-thread cells and sums on read, avoiding CAS retries on a single hot variable. Use `AtomicLong` when you need `compareAndSet` or an exact value at an instant.

## Why does `ConcurrentHashMap` reject null keys and values?

Because `get` returning null must unambiguously mean "absent"; with concurrent updates a separate `containsKey` check could already be stale. Nulls would make `get`, `merge` and `computeIfAbsent` ambiguous.

## `Collections.synchronizedMap` versus `ConcurrentHashMap`?

`synchronizedMap` wraps every method in one lock, serialising all access, and iteration still needs manual locking. `ConcurrentHashMap` locks per bucket, has lock-free reads, atomic `compute`/`merge` and weakly consistent iterators.

## When is `CopyOnWriteArrayList` the right choice?

Read-mostly data with rare writes, such as listener lists or feature flags: iteration never throws and sees a consistent snapshot. Each write copies the whole array, so it is wrong for frequently mutated lists.

## `CountDownLatch` versus `CyclicBarrier`?

A latch is one-shot: threads count it down and waiters proceed at zero, no reset. A barrier makes a fixed set of threads wait for each other, optionally runs an action, and resets for the next phase.

## `thenApply` versus `thenCompose` on a `CompletableFuture`?

`thenApply` maps the value with a plain function and would nest a returned future. `thenCompose` takes a function returning a future and flattens it, like `flatMap` or JS `then` returning a promise. Use it whenever the next step is asynchronous.

## On which thread does a `thenApply` callback run?

On the thread that completes the previous stage if it is still pending, or on the calling thread if already complete. `thenApplyAsync` moves it to the common `ForkJoinPool` or the executor you pass.

## Why should you not block inside the common `ForkJoinPool`?

It has only cores minus one threads and is shared by parallel streams and every default `supplyAsync`. A few blocking I/O calls occupy all of them and stall unrelated async work. Give I/O its own executor or virtual threads.

## How do exceptions propagate through a `CompletableFuture` chain?

A failed stage completes exceptionally; dependent normal stages are skipped and complete with a `CompletionException` wrapping the cause, until `exceptionally`, `handle` or `whenComplete` observes it. Unobserved failures are silent, so always terminate the chain.

## How do you wait for several `CompletableFuture`s and collect their results?

`CompletableFuture.allOf(futures...)` returns `CompletableFuture<Void>`; chain `thenApply` that calls `join()` on each original future, which no longer blocks. Any failure fails the `allOf`; use `handle` per future for all-settled semantics.

## What problem do virtual threads solve?

Thread-per-request without the cost of OS threads. A virtual thread's stack lives on the heap and it mounts on a carrier only while running, unmounting on blocking I/O, so millions can wait concurrently while ordinary blocking code stays readable.

## What is pinning in virtual threads?

Blocking while the thread cannot unmount, holding its carrier: inside `synchronized` on JDK 21 to 23, or in a native frame. Fix with `ReentrantLock` around blocking calls or upgrade to JDK 24+, where `synchronized` no longer pins.

## What is structured concurrency?

Confining subtasks to a lexical scope: fork inside a `StructuredTaskScope`, join, and the block cannot exit while subtasks run. A failure cancels siblings and propagates, nothing leaks, and thread dumps show the task tree. Preview in Java 21 and still preview in 25, so enable it explicitly.

## Do we still need reactive programming after virtual threads?

For request/response services, blocking code on virtual threads is simpler and scales comparably, so reactive is no longer necessary there. Reactive still fits streaming with backpressure and event-driven composition. Choose per workload.

## What are the four conditions for a deadlock?

Mutual exclusion, hold-and-wait, no preemption and circular wait. Breaking any one prevents deadlock; in practice you break circular wait with a global lock order or hold-and-wait with `tryLock` and backoff.

## How do you prevent deadlock when transferring between two accounts?

Acquire both locks in a consistent global order, for example by account id, so no two threads can hold them in opposite orders. Alternatively `tryLock` both with a timeout and release and retry on failure.

## How do you detect a deadlock in a running JVM?

Take a thread dump with `jstack` or `jcmd <pid> Thread.print`; the JVM prints "Found one Java-level deadlock" with the cycle. Inside the JVM, `ThreadMXBean.findDeadlockedThreads()` can back a health check.

## What is the difference between livelock and starvation?

Livelock: threads keep running and reacting to each other but never progress, typically from symmetric retry-and-back-off. Starvation: a runnable thread never gets the lock or CPU because others always win. Fix with randomised backoff and fair locks respectively.

## How do you approach "make this class thread-safe"?

Identify shared mutable state and compound actions, prefer immutability or thread confinement, otherwise guard all access with one lock (coarse first, getters included), then narrow with concurrent collections or atomics only where profiling shows contention. Document which lock guards what.

## `ConcurrentHashMap` is thread-safe, so why can code using it still race?

Thread safety is per method. `get` followed by `put` is two calls that another thread can interleave. Use the atomic `putIfAbsent`, `computeIfAbsent`, `compute` or `merge` for compound actions.

## Why must `wait()` be called inside a `while` loop?

Threads can wake spuriously, and by the time a woken thread reacquires the monitor another thread may have consumed the condition. Re-checking the predicate in a loop is the only correct pattern; the same applies to `Condition.await`.

## `notify()` or `notifyAll()`?

`notifyAll` unless every waiter waits for the same condition and any one can proceed. With producers and consumers on one monitor, `notify` may wake the wrong kind and stall everyone; with `ReentrantLock` use separate `Condition`s and `signal`.
