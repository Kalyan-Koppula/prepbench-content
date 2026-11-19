---
title: Concurrency Exercises Walkthrough
order: 7
summary: Correct sketches for the canonical live-coding tasks - thread-safe counter, bounded buffer with wait/notify and with BlockingQueue, token-bucket rate limiter, LRU cache with locks, parallel sum with CompletableFuture, and odd/even printing with two threads.
---

These six tasks cover most of what gets typed on a shared screen in a Java concurrency round. For each: the trap the interviewer is watching for, then a sketch that is actually correct. Practise typing them; the follow-up questions are listed so you can rehearse the conversation.

## 1. Thread-safe counter

Trap: `count++` is not atomic; `volatile` does not fix it.

```java
public class Counter {
    private final AtomicLong count = new AtomicLong();
    public void increment() { count.incrementAndGet(); }
    public long get() { return count.get(); }
}

// Lock version, when you also need an invariant across fields
public class BoundedCounter {
    private long count;
    private final long max;
    public BoundedCounter(long max) { this.max = max; }
    public synchronized boolean increment() {
        if (count >= max) return false;
        count++;
        return true;
    }
    public synchronized long get() { return count; }
}
```

Follow-ups: why `get` must also be synchronised (visibility); when `LongAdder` beats `AtomicLong` (write-heavy metrics); what happens under contention with CAS (retries, no blocking).

## 2. Bounded buffer (producer/consumer)

Trap: `if` instead of `while` around `wait`, `notify` instead of `notifyAll`, calling `wait` without holding the monitor.

```java
public class BoundedBuffer<T> {
    private final Object[] items;
    private int head, tail, count;

    public BoundedBuffer(int capacity) { items = new Object[capacity]; }

    public synchronized void put(T item) throws InterruptedException {
        while (count == items.length) wait();      // while: spurious wakeups and competing producers
        items[tail] = item;
        tail = (tail + 1) % items.length;
        count++;
        notifyAll();                               // wake consumers (and producers; harmless)
    }

    @SuppressWarnings("unchecked")
    public synchronized T take() throws InterruptedException {
        while (count == 0) wait();
        T item = (T) items[head];
        items[head] = null;
        head = (head + 1) % items.length;
        count--;
        notifyAll();
        return item;
    }
}
```

With `ReentrantLock` and two conditions, which is the "do it properly" follow-up:

```java
public class BoundedBuffer<T> {
    private final Object[] items;
    private int head, tail, count;
    private final ReentrantLock lock = new ReentrantLock();
    private final Condition notFull = lock.newCondition();
    private final Condition notEmpty = lock.newCondition();

    public BoundedBuffer(int capacity) { items = new Object[capacity]; }

    public void put(T item) throws InterruptedException {
        lock.lock();
        try {
            while (count == items.length) notFull.await();
            items[tail] = item; tail = (tail + 1) % items.length; count++;
            notEmpty.signal();                     // only consumers need waking
        } finally { lock.unlock(); }
    }

    @SuppressWarnings("unchecked")
    public T take() throws InterruptedException {
        lock.lock();
        try {
            while (count == 0) notEmpty.await();
            T item = (T) items[head]; items[head] = null;
            head = (head + 1) % items.length; count--;
            notFull.signal();
            return item;
        } finally { lock.unlock(); }
    }
}
```

And the answer you give first in real life:

```java
BlockingQueue<Task> queue = new ArrayBlockingQueue<>(100);
// producer
queue.put(task);           // blocks when full
// consumer
Task t = queue.take();     // blocks when empty
```

Follow-ups: why `notifyAll` with a single condition (a `notify` could wake a producer when a consumer was needed, stalling everyone); how to shut down consumers (poison pill, or `poll` with timeout and a `volatile` flag); fairness.

## 3. Token-bucket rate limiter

Trap: a background refill thread (unnecessary); using `System.currentTimeMillis` (wall clock jumps); not making refill-and-consume atomic.

```java
public class TokenBucket {
    private final long capacity;
    private final double refillPerNano;
    private double tokens;
    private long last;

    public TokenBucket(long capacity, long refillPerSecond) {
        this.capacity = capacity;
        this.refillPerNano = refillPerSecond / 1e9;
        this.tokens = capacity;
        this.last = System.nanoTime();
    }

    public synchronized boolean tryAcquire() {
        long now = System.nanoTime();
        tokens = Math.min(capacity, tokens + (now - last) * refillPerNano);   // lazy refill
        last = now;
        if (tokens >= 1) { tokens -= 1; return true; }
        return false;
    }
}
```

Lazy refill on each call means no timer thread, and `synchronized` makes the refill plus the decrement one atomic step. For many independent keys (per-user limits), keep a `ConcurrentHashMap<String, TokenBucket>` with `computeIfAbsent`.

Follow-ups: token bucket vs leaky bucket vs sliding window (burst tolerance); distributed limiting (Redis `INCR` with TTL, or a Lua script for atomic bucket math); what to return when rejected (429 with `Retry-After`).

## 4. LRU cache with locks

Trap: `LinkedHashMap` in access-order mode is not thread-safe, and a `ReadWriteLock` does not help because `get` reorders the entries and is therefore a write. One exclusive lock around every operation is the correct baseline.

```java
public class LruCache<K, V> {
    private final int capacity;
    private final LinkedHashMap<K, V> map;
    private final ReentrantLock lock = new ReentrantLock();

    public LruCache(int capacity) {
        this.capacity = capacity;
        this.map = new LinkedHashMap<>(16, 0.75f, true) {
            @Override protected boolean removeEldestEntry(Map.Entry<K, V> e) {
                return size() > LruCache.this.capacity;
            }
        };
    }

    public V get(K key) {
        lock.lock();
        try { return map.get(key); }        // get() reorders, so it is a write; it needs the lock
        finally { lock.unlock(); }
    }

    public void put(K key, V value) {
        lock.lock();
        try { map.put(key, value); }
        finally { lock.unlock(); }
    }
}
```

The from-scratch version (hash map plus doubly linked list) is the same code with your own `Node` class, and the point to make is that *every* operation including `get` mutates the list, so a `ReadWriteLock` buys nothing. Production answer: Caffeine, which uses a lock-free buffer of reads and applies reorders in batches.

Follow-ups: why `get` is a write here; how Caffeine avoids the global lock (striped, asynchronous eviction); TTL expiry on top of LRU.

## 5. Parallel sum with CompletableFuture

Trap: summing into a shared `int` from the tasks; blocking the common pool; forgetting that `allOf` returns `Void`.

```java
public static long parallelSum(long[] data, int parts, ExecutorService pool) {
    int chunk = (data.length + parts - 1) / parts;
    List<CompletableFuture<Long>> partials = new ArrayList<>();
    for (int i = 0; i < data.length; i += chunk) {
        int from = i, to = Math.min(data.length, i + chunk);
        partials.add(CompletableFuture.supplyAsync(() -> {
            long s = 0;
            for (int j = from; j < to; j++) s += data[j];
            return s;                                    // each task returns its own result
        }, pool));
    }
    return partials.stream().mapToLong(CompletableFuture::join).sum();   // or allOf + thenApply
}
```

Each task owns a disjoint slice and returns a value; the merge happens once in the caller, so there is no shared mutable state at all. For a CPU-bound sum `pool` should be sized to cores, or just use `Arrays.stream(data).parallel().sum()` and say that it is the same idea on `ForkJoinPool`.

Follow-ups: when `LongStream.parallel().sum()` is enough; how `ForkJoinPool` splits recursively (`RecursiveTask`); why `join` at the end is fine but `join` inside a task is not.

## 6. Print odd and even with two threads

Trap: busy-waiting on a flag without `volatile`, or `notify` without the monitor. Interviewers also accept a `Semaphore` version, which is cleaner.

```java
public class OddEven {
    private final int max;
    private int next = 1;
    private final Object lock = new Object();

    public OddEven(int max) { this.max = max; }

    private void print(boolean odd) throws InterruptedException {
        synchronized (lock) {
            while (next <= max) {
                if ((next % 2 == 1) != odd) { lock.wait(); continue; }
                System.out.println(Thread.currentThread().getName() + ": " + next++);
                lock.notifyAll();
            }
        }
    }

    public static void main(String[] args) throws InterruptedException {
        OddEven oe = new OddEven(10);
        Thread a = new Thread(() -> { try { oe.print(true); } catch (InterruptedException e) { Thread.currentThread().interrupt(); } }, "odd");
        Thread b = new Thread(() -> { try { oe.print(false); } catch (InterruptedException e) { Thread.currentThread().interrupt(); } }, "even");
        a.start(); b.start();
        a.join(); b.join();
    }
}
```

Semaphore version, two permits hand off in turn:

```java
Semaphore oddTurn = new Semaphore(1), evenTurn = new Semaphore(0);
Runnable odd = () -> { for (int i = 1; i <= 10; i += 2) { oddTurn.acquireUninterruptibly(); System.out.println(i); evenTurn.release(); } };
Runnable even = () -> { for (int i = 2; i <= 10; i += 2) { evenTurn.acquireUninterruptibly(); System.out.println(i); oddTurn.release(); } };
```

Follow-ups: generalise to N threads printing in round-robin (an index modulo N and `notifyAll`, or an array of semaphores); why this is a synchronisation puzzle rather than a parallelism gain (it is strictly serial by design).

## What the grader is listening for

- You name the shared state and the invariant before typing.
- `while`, not `if`, around every `wait`/`await`.
- `unlock` in `finally`; `remove` on `ThreadLocal`; shutdown on executors.
- You know the library answer (`BlockingQueue`, `AtomicLong`, `Semaphore`) and can also show the primitive version when asked.
- You can say what would change for virtual threads (prefer `ReentrantLock` over `synchronized` around blocking calls on JDK 21; no pooling).

## Common interview questions

**Why must `wait()` be called in a loop?** Because a thread can wake spuriously, and because by the time it reacquires the monitor another thread may have consumed the condition it was waiting for. Re-checking the predicate in a `while` is the only way to be correct.

**`notify` or `notifyAll`?** `notifyAll` unless every waiter is waiting for the same condition and any one of them can proceed. With a single monitor shared by producers and consumers, `notify` can wake the wrong kind of thread and stall the system.

**Why is `get` on an LRU cache a write operation?** Because reading an entry moves it to the most-recently-used position, mutating the linked order. That is why it needs the exclusive lock and why a read-write lock does not help.

**How does a token bucket differ from a sliding-window limiter?** A token bucket allows bursts up to its capacity and then refills at a steady rate; a sliding window counts requests in a trailing interval and gives a smoother cap with no burst allowance. Token bucket is the usual API-gateway choice.

**How do you sum a large array in parallel safely?** Split into disjoint ranges, have each task compute and return its own partial sum, then combine the results in the caller. No shared mutable accumulator, no locks; equivalent to `LongStream.parallel().sum()`.

**How would you shut down a producer/consumer system cleanly?** Stop producers, then enqueue one poison-pill sentinel per consumer so each `take()` returns and the consumer exits; or interrupt the consumers and have them exit on `InterruptedException`. Then `shutdown` and `awaitTermination` the executor.

**What changes in these solutions on virtual threads?** The logic is identical, but on Java 21 long waits inside `synchronized` pin the carrier, so prefer the `ReentrantLock`/`Condition` versions or `BlockingQueue`, and never pool the threads themselves.

## Pitfalls

- Using `if` instead of `while` around `wait()`; spurious wake-ups and competing consumers require re-checking the condition.
- `notify` where several kinds of waiters share a monitor; use `notifyAll` or separate `Condition`s.
- Testing concurrent code with one run; repeat under load, and use tools like jcstress for memory-model questions.
- Forgetting to make shared counters atomic in the "simple" parts of an exercise.
- Leaving executors running at the end of an exercise.

## Key takeaways

- Start every exercise by naming the shared state and the invariant that must hold.
- Prefer high-level tools (`BlockingQueue`, atomics, `ConcurrentHashMap`, `Semaphore`) before `wait`/`notify`.
- Guard waits with `while` loops on the condition.
- Explain happens-before for each hand-off between threads.
- Test with many threads and repetitions, and shut everything down cleanly.
