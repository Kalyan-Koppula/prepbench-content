---
title: Locks, Atomics and Concurrent Collections
order: 3
summary: ReentrantLock vs synchronized, ReadWriteLock and StampedLock, CAS and the Atomic classes, LongAdder, ConcurrentHashMap semantics, CopyOnWriteArrayList, the BlockingQueue family and the three synchronisers.
---

`java.util.concurrent` is the toolbox interviewers expect you to reach for instead of hand-rolling `synchronized` blocks. The questions are "when would you use X over Y" and "what does this method guarantee", so this sheet is organised as contrasts.

## `ReentrantLock` vs `synchronized`

```java
private final ReentrantLock lock = new ReentrantLock();   // new ReentrantLock(true) for fairness

void transfer() {
    lock.lock();
    try {
        // critical section
    } finally {
        lock.unlock();          // always in finally; no automatic release
    }
}

if (lock.tryLock(500, TimeUnit.MILLISECONDS)) { ... }   // give up instead of deadlocking
lock.lockInterruptibly();                               // can be interrupted while waiting
```

| | `synchronized` | `ReentrantLock` |
|---|---|---|
| Release | Automatic at block exit | Manual, in `finally` |
| Try with timeout | No | `tryLock()`, `tryLock(timeout)` |
| Interruptible wait | No | `lockInterruptibly()` |
| Fairness | No | Optional (slower) |
| Multiple conditions | One wait set per monitor | `newCondition()` as many as you need |
| Lock across method boundaries | Impossible | Possible (hand-over-hand locking) |
| Monitoring | Thread dumps show it | `isLocked`, `getQueueLength`, `hasQueuedThreads` |
| Virtual threads (JDK 21) | Pins the carrier while blocked | Does not pin |

Default to `synchronized` for simple, short sections; switch to `ReentrantLock` when you need `tryLock`, timeouts, fairness, multiple conditions, or you are on virtual threads and the lock is held across blocking I/O. Both are reentrant and give the same memory-visibility guarantees.

`Condition` replaces `wait`/`notify`: `cond.await()` (in a `while` loop) and `cond.signal()`/`signalAll()`, with separate `notFull`/`notEmpty` conditions so a producer does not wake other producers.

## `ReadWriteLock` and `StampedLock`

```java
private final ReentrantReadWriteLock rw = new ReentrantReadWriteLock();

V get(K k)        { rw.readLock().lock();  try { return map.get(k); }  finally { rw.readLock().unlock(); } }
void put(K k, V v){ rw.writeLock().lock(); try { map.put(k, v); }      finally { rw.writeLock().unlock(); } }
```

Many readers or one writer. Worth it only when reads vastly outnumber writes and the read section is long enough to make the extra bookkeeping pay; for a plain map, `ConcurrentHashMap` wins. A read lock cannot be upgraded to a write lock (deadlock); downgrade is allowed.

`StampedLock` adds optimistic reads: `long s = sl.tryOptimisticRead(); read fields; if (!sl.validate(s)) fall back to a real read lock`. Faster for read-mostly data, but not reentrant and has no conditions; mention it in one sentence and move on.

## Atomics and CAS

```java
AtomicInteger hits = new AtomicInteger();
hits.incrementAndGet();                              // atomic ++
hits.compareAndSet(expected, newValue);              // the primitive everything is built on
hits.updateAndGet(x -> Math.min(x + 1, 100));       // retry loop with a lambda
hits.accumulateAndGet(5, Integer::sum);

AtomicReference<Config> current = new AtomicReference<>(initial);
current.getAndUpdate(c -> c.withTimeout(30));       // swap an immutable snapshot
```

Compare-and-swap: "set to `new` only if it still equals `expected`", executed as one CPU instruction (`lock cmpxchg`). `incrementAndGet` is a loop: read, compute, CAS, retry on failure. No blocking, no deadlock, no context switch; under heavy contention many threads retry and burn CPU.

- `AtomicInteger`, `AtomicLong`, `AtomicBoolean`, `AtomicReference`, `AtomicIntegerArray`, plus `AtomicStampedReference` for the ABA problem (value went A, B, A and a CAS cannot tell).
- Atomics give volatile semantics for visibility.
- They are per-variable: two atomics are not atomic *together*. An invariant spanning two fields still needs a lock or a single `AtomicReference` to an immutable pair.

## `LongAdder`

```java
LongAdder requests = new LongAdder();
requests.increment();     // from many threads
long total = requests.sum();   // not a snapshot under concurrent updates
```

Under contention an `AtomicLong` serialises every CAS on one cache line. `LongAdder` keeps a striped array of cells, each thread hitting its own, and sums on read. Use it for counters and metrics that are written far more than read; use `AtomicLong` when you need `compareAndSet` or an exact value at a moment.

## `ConcurrentHashMap`

Lock-striped hash map (per-bucket CAS/synchronisation since Java 8, no global lock). Reads never block; writes lock only the bucket.

```java
ConcurrentHashMap<String, Integer> counts = new ConcurrentHashMap<>();
counts.merge(word, 1, Integer::sum);                                   // atomic increment-or-insert
counts.compute(word, (k, v) -> v == null ? 1 : v + 1);                 // atomic read-modify-write
counts.computeIfAbsent(key, k -> expensiveInit(k));                    // runs at most once per key
Set<String> seen = ConcurrentHashMap.newKeySet();                       // concurrent set

// Not atomic: check-then-act with separate calls
if (!counts.containsKey(word)) counts.put(word, 1);    // race; use putIfAbsent/merge
```

Semantics to state:

- `compute*`/`merge` are atomic per key and the remapping function runs under the bucket lock, so it must be short and must not touch the same map (recursive `computeIfAbsent` can deadlock or throw `IllegalStateException`).
- No null keys or values. `get` returning null must mean "absent" unambiguously, because a `containsKey` + `get` pair is not atomic.
- `size()`, `isEmpty()` and `containsValue` are estimates under concurrent updates; `mappingCount()` returns a `long`. Do not use `size()` for control flow.
- Iterators and bulk views are weakly consistent: never throw `ConcurrentModificationException`, reflect some subset of concurrent updates.
- Bulk parallel operations: `forEach(threshold, ...)`, `reduce`, `search`.
- Versus `Collections.synchronizedMap`: that wraps every method in one lock, so it is correct but serialises everything, and iteration still needs manual synchronisation.

## `CopyOnWriteArrayList`

Every mutation copies the whole backing array; reads and iteration touch an immutable snapshot with no locking. Iterators never throw and never see later writes. Perfect for listener lists and configuration read thousands of times and changed rarely; catastrophic for a list written in a loop (O(n) per write, garbage). `CopyOnWriteArraySet` is the same idea with `addIfAbsent`.

## `BlockingQueue` family

| Implementation | Bounded | Notes |
|---|---|---|
| `ArrayBlockingQueue` | Yes, fixed | Single lock, optional fairness |
| `LinkedBlockingQueue` | Optional | Separate put/take locks, higher throughput |
| `PriorityBlockingQueue` | No | Ordered by comparator |
| `DelayQueue` | No | Elements available after their delay; schedulers |
| `SynchronousQueue` | Zero capacity | Direct hand-off; backs `newCachedThreadPool` |
| `LinkedTransferQueue` | No | `transfer()` waits for a consumer |

Four behaviours per operation:

| | Throws | Returns special | Blocks | Times out |
|---|---|---|---|---|
| Insert | `add` | `offer` → false | `put` | `offer(e, t, unit)` |
| Remove | `remove` | `poll` → null | `take` | `poll(t, unit)` |
| Inspect | `element` | `peek` | | |

Producer/consumer in one line: producers `put`, consumers `take`, the bounded capacity is the backpressure. A "poison pill" sentinel object is the standard shutdown signal.

## Synchronisers

```java
// CountDownLatch: one-shot "wait for N events"
CountDownLatch ready = new CountDownLatch(workers);
for (...) pool.submit(() -> { init(); ready.countDown(); });
ready.await();                                // main waits for all workers

// CyclicBarrier: N parties wait for each other, reusable, optional action at the trip
CyclicBarrier barrier = new CyclicBarrier(4, () -> mergePartialResults());
barrier.await();                              // each of 4 threads calls this per phase

// Semaphore: N permits, bounded resource access / rate limiting
Semaphore slots = new Semaphore(10);
slots.acquire(); try { callDownstream(); } finally { slots.release(); }
if (slots.tryAcquire()) { ... }

// Phaser: barrier with dynamic party count; Exchanger: pairwise swap
```

Contrast to recite: a latch counts down and cannot be reset; a barrier waits for a fixed number of threads to arrive and resets for the next round; a semaphore limits how many are inside at once and does not care which thread releases.

## Choosing, quickly

| Problem | Reach for |
|---|---|
| Counter / metric | `LongAdder`, or `AtomicLong` when you need CAS |
| Shared cache / registry | `ConcurrentHashMap` with `computeIfAbsent` |
| Swap config atomically | `AtomicReference<ImmutableConfig>` or `volatile` |
| Listener list | `CopyOnWriteArrayList` |
| Producer/consumer | `BlockingQueue` |
| Limit concurrent calls | `Semaphore` |
| Wait for startup / fan-in | `CountDownLatch`, or `CompletableFuture.allOf` |
| Invariants across several fields | A lock (`synchronized` or `ReentrantLock`) |
| Read-heavy, long read sections | `ReadWriteLock` / `StampedLock` |

## Common interview questions

**When would you choose `ReentrantLock` over `synchronized`?** When you need `tryLock` with a timeout to avoid deadlock, interruptible acquisition, fairness, multiple `Condition`s, a lock held across method calls, or non-pinning behaviour on virtual threads. Otherwise `synchronized` is simpler and releases automatically.

**How does `AtomicInteger.incrementAndGet` work without a lock?** It loops: read the current value, compute the new one, and `compareAndSet(old, new)`; if another thread changed the value in between the CAS fails and it retries. The CAS is a single hardware instruction, so no thread is ever blocked.

**Why does `ConcurrentHashMap` forbid null?** Because with concurrent updates `get` returning null must unambiguously mean "no mapping"; a separate `containsKey` check could be stale. Null values would make `get`, `computeIfAbsent` and `merge` ambiguous.

**Is `ConcurrentHashMap.size()` accurate?** It is an estimate under concurrent writes, computed from striped counters without locking the whole map. Never use it (or `isEmpty`) for correctness decisions; use `putIfAbsent`/`compute` return values instead.

**`HashMap` vs `Collections.synchronizedMap` vs `ConcurrentHashMap`?** `HashMap` is unsafe for concurrent writes. `synchronizedMap` wraps each call in a single lock, serialising all access and still requiring manual locking for iteration. `ConcurrentHashMap` locks per bucket, has lock-free reads, atomic `compute`/`merge`, and weakly consistent iterators.

**When is `CopyOnWriteArrayList` appropriate?** Read-mostly data with rare writes, such as listener registrations or feature flags, where iteration must never throw and must see a consistent snapshot. Writes copy the entire array, so it is wrong for anything written frequently.

**`CountDownLatch` vs `CyclicBarrier`?** A latch is one-shot: threads count it down, waiters release when it hits zero, and it cannot be reused. A barrier makes a fixed set of threads wait for each other at a point, runs an optional action, and resets for the next phase.

**What is `LongAdder` and why not just `AtomicLong`?** `LongAdder` spreads increments across per-thread cells to avoid contention on a single CAS and sums them on read. Use it for hot write-heavy counters; use `AtomicLong` when you need compare-and-set or a precise instantaneous value.

**What is the ABA problem?** A CAS checks that a value still equals `A`, but it may have changed to `B` and back to `A` in between, so the check passes while state has moved. `AtomicStampedReference` pairs the value with a version stamp to detect it; it mostly matters in lock-free data structures.
