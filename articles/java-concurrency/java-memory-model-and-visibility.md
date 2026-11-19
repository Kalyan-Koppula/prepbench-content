---
title: The Java Memory Model and Visibility
order: 2
summary: Happens-before, what volatile guarantees and what it does not, synchronized and monitors, the double-checked locking saga, safe publication and the final-field guarantee.
---

Single-threaded JavaScript never made you think about one thread's writes being invisible to another. Java does: without synchronisation the compiler, the JIT and the CPU may reorder operations and keep values in registers or caches, so a thread can spin forever on a flag another thread already set. The Java Memory Model (JMM, JLS chapter 17) defines exactly when a write is guaranteed visible. Interviewers probe it with `volatile`, `synchronized` and the double-checked locking question.

## The problem in one snippet

```java
class Stopper {
    private boolean stop = false;       // not volatile

    void loop() { while (!stop) { /* work */ } }   // may never exit
    void halt() { stop = true; }
}
```

Without `volatile`, the JIT is allowed to hoist `stop` into a register and compile `loop` to `while (true)`. Nothing is "wrong" with the CPU cache here; it is a legal optimisation because no happens-before edge connects `halt` to `loop`.

## Happens-before

The JMM rule: a read is guaranteed to see a write if the write *happens-before* the read. Edges that create it:

| Action A | Happens-before |
|---|---|
| Any statement in a thread | Later statements in the same thread (program order) |
| Unlock of a monitor | Every subsequent lock of the same monitor |
| Write to a `volatile` field | Every subsequent read of that field |
| `Thread.start()` | Everything in the started thread |
| Everything in a thread | A `join()` on it returning |
| Putting into a concurrent collection, submitting to an executor, completing a `Future` | Taking it out, running the task, `get()` returning |
| Constructor finishing | Any thread reading a `final` field of the object (with a caveat below) |

Happens-before is transitive, which is the whole trick: if thread A writes ten fields and then writes a volatile flag, and thread B reads the flag and sees the new value, B is guaranteed to see all ten fields too. One volatile write "publishes" everything before it.

## `volatile`

What it does:

- Every read goes to memory (no register caching); every write is immediately visible to subsequent reads on any thread.
- Acts as a memory barrier: operations before a volatile write cannot be reordered after it; operations after a volatile read cannot be reordered before it (acquire/release semantics).
- Makes 64-bit `long`/`double` reads and writes atomic (they can otherwise tear on 32-bit JVMs).

What it does not do:

- It does not make compound operations atomic. `count++` is read-modify-write: two threads can both read 5 and both write 6. Use `AtomicInteger` or a lock.
- It does not provide mutual exclusion. Two threads can still run a critical section simultaneously.
- It does not make the *object* thread-safe; a `volatile List` field just means you always see the latest list reference, not that the list's contents are safe.

Good uses: a status flag, a configuration reference swapped atomically, the "initialised" marker in double-checked locking, publishing an immutable snapshot.

## `synchronized`

```java
public class Counter {
    private int count;
    public synchronized void increment() { count++; }          // locks `this`
    public synchronized int get() { return count; }            // readers must lock too
    public static synchronized void staticOp() {}              // locks Counter.class

    private final Object lock = new Object();
    public void other() {
        synchronized (lock) { /* ... */ }                      // private lock object: callers cannot interfere
    }
}
```

- Every object has an intrinsic lock (monitor). `synchronized` acquires it on entry and releases it on exit, including on exception.
- Mutual exclusion *and* visibility: the unlock happens-before the next lock, so whatever the previous holder wrote is visible.
- Reentrant: a thread that holds the monitor can enter other `synchronized` blocks on the same object (a hold count tracks depth). This is why a synchronized method can call another synchronized method on `this` without deadlocking itself.
- Both reads and writes must synchronise. A `synchronized` setter with an unsynchronised getter has no visibility guarantee for the getter.
- `wait()`/`notify()`/`notifyAll()` belong to the monitor; calling them without holding it throws `IllegalMonitorStateException`. Always `wait` inside a `while` loop re-checking the condition (spurious wakeups are legal).
- Locking on `this` or a public object lets outside code lock the same monitor; prefer a private final lock field. Never lock on `String` literals or boxed primitives (they are shared/interned).
- Cost: uncontended `synchronized` is cheap (thin locks; biased locking was disabled in 15 and removed in 18); contended locks park threads. With virtual threads, `synchronized` blocks could pin the carrier before JDK 24, which is why `ReentrantLock` was recommended on 21 for long waits.

## Double-checked locking

The lazy singleton that was broken for years and is the canonical JMM question.

```java
public class Config {
    private static volatile Config instance;       // volatile is the fix

    public static Config get() {
        Config c = instance;                      // first check, no lock
        if (c == null) {
            synchronized (Config.class) {
                c = instance;                     // second check, under the lock
                if (c == null) instance = c = new Config();
            }
        }
        return c;
    }
}
```

Without `volatile`: `instance = new Config()` is allocate, construct, assign, and the JIT may reorder construct and assign. Another thread can see a non-null `instance` pointing at a half-constructed object and skip the lock. `volatile` forbids the reordering: the write to `instance` happens-after construction, and the unlocked read sees either null or a fully built object.

The answers interviewers prefer over DCL:

```java
// 1. Eager: class loading is lazy anyway
private static final Config INSTANCE = new Config();

// 2. Holder idiom: lazy, thread-safe by the class-init lock, no volatile
private static class Holder { static final Config INSTANCE = new Config(); }
public static Config get() { return Holder.INSTANCE; }

// 3. Enum singleton: serialization-safe too
public enum Config { INSTANCE; }
```

## Safe publication

Publishing an object means making its reference visible to another thread. It is *safe* if that thread is guaranteed to see the fully constructed state. Safe ways:

- Initialise it in a static initialiser.
- Store the reference in a `volatile` field or an `AtomicReference`.
- Store it in a `final` field of a properly constructed object.
- Guard it with a lock (`synchronized`), or hand it over through a concurrent collection, a `BlockingQueue`, an executor, or a `Future`.

Unsafe: assigning to a plain field and reading it from another thread. The reader may see a null, the default field values, or a mix. This also covers the "this escape" bug: registering `this` as a listener inside a constructor publishes a half-built object.

## `final` fields

The JMM gives `final` fields a special guarantee: if an object is constructed without letting `this` escape, every thread that obtains a reference to it will see the correctly initialised values of its `final` fields, with no synchronisation at all. Non-final fields of the same object have no such guarantee.

This is why immutable classes (all fields `final`, no setters, defensive copies, class `final` or constructors private) are automatically thread-safe and can be shared freely. Records are the modern shorthand: every component is a `final` field.

```java
public final class Money {
    private final long cents;
    private final List<String> tags;
    public Money(long cents, List<String> tags) {
        this.cents = cents;
        this.tags = List.copyOf(tags);     // defensive copy, the list must be immutable too
    }
}
```

Caveat: the guarantee covers the field value, so for `final List<String> tags` it covers the reference and, transitively, the state reachable *as of construction end*. Mutating the list afterwards is back to ordinary rules.

## Atomicity, visibility, ordering: the three questions

When reasoning about any shared variable, ask:

1. Atomicity: can another thread observe a half-done operation? (`count++`, `long` writes, check-then-act.)
2. Visibility: is the write guaranteed to reach the other thread? (`volatile`, locks, `final`.)
3. Ordering: can the compiler/CPU reorder this relative to other memory operations? (barriers from `volatile`/locks.)

`volatile` solves 2 and 3. Locks and atomics solve all three. Immutability sidesteps all three.

## Worked example: a stop flag that never stops

```java
class Worker implements Runnable {
    private boolean running = true; // not volatile

    public void run() {
        long count = 0;
        while (running) {
            count++;
        }
        System.out.println("stopped after " + count);
    }

    void stop() { running = false; }
}

Worker w = new Worker();
new Thread(w).start();
Thread.sleep(1000);
w.stop(); // the worker may loop forever
```

Without `volatile`, nothing creates a happens-before edge between the write in `stop()` and the reads in the loop. The JIT is allowed to hoist the read out of the loop (`if (running) while (true) count++;`), because, from a single thread's point of view, nothing in the loop changes `running`. On a real JVM this program often never terminates.

Declaring the field `volatile` fixes it: every read sees the most recent write, and the JIT can't hoist the read. An `AtomicBoolean` works the same way, and interrupting the thread (`while (!Thread.currentThread().isInterrupted())`) is the idiomatic alternative for stopping tasks.

## The happens-before edges you actually use

| Action A | happens-before action B when… |
| --- | --- |
| Any action in a thread | B comes later in the same thread (program order) |
| Unlocking a monitor or `Lock` | B is a later lock of the same monitor or `Lock` |
| Writing a `volatile` field | B is a later read of the same field |
| `Thread.start()` | B is any action in the started thread |
| Any action in a thread | B is a successful `join()` on that thread |
| Submitting a task to an executor | B is any action in the task |
| Completing a `Future` | B follows `get()` returning |
| Putting into a `BlockingQueue` / `ConcurrentHashMap` | B is the `take` or `get` that sees it |
| Writing `final` fields in a constructor | B is any read through a properly published reference |

And it's **transitive**: if A happens-before B and B happens-before C, then A happens-before C. That's how a `volatile` flag can safely publish a whole object graph:

```java
private Config config;            // plain field
private volatile boolean ready;   // the "publication" flag

void publish() {                  // writer thread
    config = loadConfig();        // 1
    ready = true;                 // 2: volatile write
}

void use() {                      // reader thread
    if (ready) {                  // 3: volatile read that sees 2
        apply(config);            // 4: guaranteed to see the fully built config from 1
    }
}
```

## Atomicity is a separate question

`volatile` gives visibility and ordering, not atomicity:

```java
private volatile int counter;
void increment() { counter++; } // read, add, write: two threads can both read 5 and both write 6
```

Use `AtomicInteger.incrementAndGet()`, a `LongAdder`, or a lock for compound actions.

## Common interview questions

**What is happens-before?** The JMM's ordering relation: if action A happens-before B, A's effects are visible to B. Program order within a thread, unlock-then-lock on a monitor, volatile write-then-read, thread start/join and executor hand-offs all create it, and it is transitive.

**What does `volatile` guarantee, and when is it not enough?** Visibility of the latest write and a barrier against reordering around it. It does not make read-modify-write sequences atomic, so `volatile int count; count++` still loses updates; use `AtomicInteger` or `synchronized` for compound actions.

**Why is double-checked locking broken without `volatile`?** The reference may be assigned before the constructor finishes due to reordering, so a second thread can read a non-null reference to a partially constructed object. Marking the field `volatile` prevents the reordering; the holder-class idiom avoids the issue entirely.

**What is the difference between `synchronized` and `volatile`?** `synchronized` gives mutual exclusion plus visibility and can protect compound actions; `volatile` gives visibility only, for a single variable, without blocking. `volatile` is cheaper and never deadlocks but covers far fewer cases.

**Is `synchronized` reentrant?** Yes; the owning thread can re-acquire the same monitor, with a count that is decremented on each exit. Without reentrancy a synchronized method calling another synchronized method on the same object would deadlock with itself.

**What is safe publication?** Making a newly constructed object visible to other threads such that they see it fully initialised. Achieved via static init, `volatile`/atomic fields, `final` fields, locks, or hand-off through concurrent utilities. Plain field assignment is not safe.

**Why are immutable objects thread-safe?** Their state never changes after construction, and the `final` field guarantee ensures every thread sees that state once it has the reference. No locking is needed to share them, and no caller can corrupt them.

**Can a `synchronized` getter and a non-synchronised setter be correct?** No. Both sides need to synchronise (or the field needs to be `volatile`) for the JMM to guarantee the getter sees the setter's write; a one-sided lock establishes no happens-before edge.

## Pitfalls

- Assuming a write made by one thread is visible to others without synchronisation.
- Using `volatile` for compound actions like `count++` or check-then-act.
- Double-checked locking without `volatile` on the instance field.
- Leaking `this` from a constructor (registering listeners, starting threads), which can expose a half-built object.
- Reasoning about concurrency from "it worked on my machine": weaker hardware memory models and the JIT expose bugs later.

## Key takeaways

- Without a happens-before edge, a thread may never see another thread's writes, or see them out of order.
- Locks, `volatile`, thread start/join, executors and concurrent collections create those edges.
- Happens-before is transitive, so one `volatile` write can publish a whole object graph.
- `volatile` provides visibility and ordering, not atomicity.
- Prefer immutable objects and safe publication through concurrent structures.
