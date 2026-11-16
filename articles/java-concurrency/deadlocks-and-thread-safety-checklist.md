---
title: Deadlocks and the Thread-Safety Checklist
order: 6
summary: The four deadlock conditions and how to break them, livelock and starvation, a step-by-step answer to "make this class thread-safe", and the three bug shapes that cause almost every race.
---

Two questions appear in nearly every Java backend loop: "what is a deadlock and how do you prevent it" and "here is a class, make it thread-safe". The first has a textbook answer you should deliver crisply; the second has a method, and interviewers grade the method more than the final code.

## Deadlock

Two or more threads each hold a lock the other needs, forever. Coffman's four conditions, all required:

1. Mutual exclusion: the resource cannot be shared.
2. Hold and wait: a thread holds one lock while waiting for another.
3. No preemption: locks cannot be forcibly taken away.
4. Circular wait: T1 waits for T2, T2 waits for T1.

```java
// Thread 1                          // Thread 2
synchronized (accountA) {            synchronized (accountB) {
    synchronized (accountB) { ... }      synchronized (accountA) { ... }
}                                    }
```

Break any one condition:

- **Lock ordering** (breaks circular wait): always acquire locks in a global order, e.g. by account id or `System.identityHashCode`. The standard transfer answer:

```java
void transfer(Account from, Account to, long amount) {
    Account first = from.id() < to.id() ? from : to;
    Account second = first == from ? to : from;
    synchronized (first) {
        synchronized (second) {
            from.debit(amount);
            to.credit(amount);
        }
    }
}
```

- **`tryLock` with timeout** (breaks hold-and-wait/no-preemption): acquire the second lock with `tryLock(100, MILLISECONDS)`; on failure release the first, back off randomly, retry.
- **One lock**: coarse-grain so there is nothing to order. Simplest, costs parallelism.
- **Avoid nested locks**: do not call unknown code (callbacks, listeners) while holding a lock; an open call cannot deadlock on your lock.
- **Lock-free structures**: `ConcurrentHashMap`, atomics, immutable snapshots.

Detection: `jstack <pid>` or `jcmd <pid> Thread.print` reports "Found one Java-level deadlock" with the cycle; `ThreadMXBean.findDeadlockedThreads()` from inside the JVM. Deadlocks also hide in `CompletableFuture.join()` inside a pool task, in `ConcurrentHashMap.computeIfAbsent` recursing into the same map, and in class initialisation cycles across threads.

## Livelock and starvation

- **Livelock**: threads keep responding to each other and never progress, like two people side-stepping in a corridor. Typical with naive `tryLock`-and-retry on both sides. Fix: randomised backoff, or ordering so one side wins.
- **Starvation**: a thread never gets the resource because others always win. Causes: unfair locks under heavy contention, a high-priority thread hogging CPU, a reader-writer lock with constant readers. Fix: fair locks (`new ReentrantLock(true)`), bounded work per hold, separate pools.

## "Make this class thread-safe", step by step

Given something like:

```java
public class Inventory {
    private final Map<String, Integer> stock = new HashMap<>();
    public void add(String sku, int n) { stock.put(sku, stock.getOrDefault(sku, 0) + n); }
    public boolean reserve(String sku, int n) {
        Integer have = stock.get(sku);
        if (have != null && have >= n) { stock.put(sku, have - n); return true; }
        return false;
    }
}
```

Say and do these in order:

1. **Identify the shared mutable state.** `stock`. Anything only touched by one thread (locals, per-request objects) is out of scope.
2. **Identify the invariants and compound actions.** `reserve` is check-then-act; `add` is read-modify-write. Each must be atomic as a whole, not per call.
3. **Can it be immutable?** Not here; stock changes. If it could, finish: `final` fields, defensive copies, no setters.
4. **Can it be confined?** If only one thread ever used it (an actor-style owner thread, a `ThreadLocal`, a request-scoped object) there is nothing to do. Here it is shared.
5. **Pick the coarsest correct lock first.** Make every public method `synchronized` (or use one private lock). Correct, simple, easy to review. Mention that all accessors, including getters, must take the lock.
6. **Then narrow only if measurements say so.** Replace with `ConcurrentHashMap` plus atomic per-key operations:

```java
public class Inventory {
    private final ConcurrentHashMap<String, Integer> stock = new ConcurrentHashMap<>();
    public void add(String sku, int n) { stock.merge(sku, n, Integer::sum); }
    public boolean reserve(String sku, int n) {
        boolean[] reserved = {false};                       // local, captured by the lambda
        stock.computeIfPresent(sku, (k, have) -> {
            if (have >= n) { reserved[0] = true; return have - n; }
            return have;
        });
        return reserved[0];
    }
}
```

The check and the decrement now happen inside one `computeIfPresent`, which runs atomically for that key. Interviewers like it when you notice that the naive `get` then `put` rewrite would reintroduce the race rather than hand-wave it.

7. **Document the policy.** Which lock guards which field (`@GuardedBy`-style comment), whether the class is immutable, thread-safe, or thread-confined.
8. **State what you did not solve.** Invariants spanning *multiple* instances (transfer between two inventories) need a higher-level lock or a transaction.

## The three bug shapes

Nearly every race in application code is one of these.

**Check-then-act**

```java
if (!map.containsKey(k)) map.put(k, v);        // another thread puts between the calls
if (file.exists()) file.delete();              // TOCTOU
```

Fix: a single atomic operation (`putIfAbsent`, `computeIfAbsent`), or hold a lock across the check and the act.

**Read-modify-write**

```java
count++;                                        // three operations
balance = balance - amount;
cache.put(k, cache.get(k) + 1);
```

Fix: `AtomicInteger`, `LongAdder`, `ConcurrentHashMap.merge`, or a lock around both steps.

**Compound actions on a thread-safe collection**

```java
// ConcurrentHashMap is thread-safe; this sequence is not
Integer v = cache.get(k);
if (v == null) { v = compute(k); cache.put(k, v); }     // use computeIfAbsent

// Collections.synchronizedList: each call is safe, iteration is not
for (String s : syncList) { ... }                       // needs synchronized (syncList) { for ... }

// size() then get()
if (!deque.isEmpty()) deque.poll();                      // poll() may return null; just check its result
```

The rule: a thread-safe class guarantees each *method* is atomic. Any sequence of two methods is your responsibility.

## Defensive habits that prevent the rest

- Prefer immutable value types (records) and swap whole snapshots via `AtomicReference`/`volatile` rather than mutating in place.
- Never let `this` escape the constructor (no registering listeners, no starting threads in constructors).
- Do not synchronise on `this` in library code; use a private final lock.
- Hold locks for as short as possible and never across I/O or callbacks into unknown code.
- One lock per invariant, not per field. Two fields that must agree need one lock.
- Make the thread-safety contract part of the type: `Collections.unmodifiableX` for views, `List.copyOf` for snapshots, `final` everywhere it compiles.
- Test with `jcstress` for real races; unit tests rarely catch them, and a test that passes a thousand times proves nothing about a race.

## Common interview questions

**What is a deadlock and how do you prevent it?** Two or more threads block forever, each waiting on a lock the other holds; it requires mutual exclusion, hold-and-wait, no preemption and a circular wait. Prevent it by acquiring locks in a global order, using `tryLock` with timeouts and backoff, or avoiding nested locks altogether.

**How would you detect a deadlock in production?** Take a thread dump with `jstack` or `jcmd Thread.print`; the JVM prints "Found one Java-level deadlock" with the cycle and stack traces. Programmatically, `ThreadMXBean.findDeadlockedThreads()` can be polled by a health check.

**What is the difference between deadlock, livelock and starvation?** Deadlock: threads block forever waiting on each other. Livelock: threads keep running and reacting but never make progress. Starvation: a runnable thread never gets scheduled or never wins the lock because others keep taking it.

**How do you make a class thread-safe?** Find the shared mutable state and the compound actions on it, prefer immutability or confinement, otherwise guard every access with one lock (coarse first), then narrow with concurrent collections or atomics only where profiling shows contention. Document which lock guards what.

**Is a `synchronized` getter necessary if the setter is synchronised?** Yes. Without it the getter has no happens-before relationship with the setter and may read a stale value indefinitely. Either synchronise both or make the field `volatile` if it is a single independent value.

**`ConcurrentHashMap` is thread-safe, so why did my code race?** Because thread safety is per method. `get` followed by `put` is two operations, and another thread can interleave. Use the atomic `putIfAbsent`, `computeIfAbsent`, `merge` or `compute` instead.

**What is check-then-act and how do you fix it?** Reading state, deciding based on it, then writing, where the state can change in between: `if (!exists) create`. Fix with an atomic primitive (`putIfAbsent`, `compareAndSet`) or by holding a lock across both steps.

**Why is calling a listener while holding a lock dangerous?** The listener is unknown code; it may block, take its own locks, or call back into your class, creating a lock-order cycle you cannot see. Copy the listener list, release the lock, then invoke ("open call").
