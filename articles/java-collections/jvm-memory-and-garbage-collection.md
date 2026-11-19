---
title: JVM Memory and Garbage Collection
order: 5
summary: Heap vs stack, generations and GC roots, G1 and ZGC in two sentences each, the OutOfMemoryError kinds, the leaks that actually happen in Java services, WeakReference, -Xmx, reading a heap dump, and class loading basics.
---

You spent years in V8 without thinking about memory beyond "don't leak closures". Java interviews ask about it directly: what lives where, how the collector decides something is garbage, why the service died with `OutOfMemoryError`, and what flags you would set. The answers are short once the model is right.

## Heap vs stack

| Region | Holds | Lifetime | Error when exhausted |
|---|---|---|---|
| Thread stack | Frames: local variables, primitives, references, return addresses | Per method call; freed on return | `StackOverflowError` |
| Heap | Every object and array, including the ones your locals point at | Until unreachable and collected | `OutOfMemoryError: Java heap space` |
| Metaspace (native) | Class metadata, method bytecode, constant pools | Until the class loader is collected | `OutOfMemoryError: Metaspace` |
| Code cache (native) | JIT-compiled machine code | JVM lifetime | Warnings, JIT disabled |
| Native memory | Direct `ByteBuffer`s, thread stacks, GC data structures, NIO | Explicit/JVM managed | Process killed by the OS, or `Direct buffer memory` |

`int x = 5` lives in the frame. `Point p = new Point(1, 2)` puts the reference `p` in the frame and the object on the heap. Escape analysis can let the JIT scalar-replace a short-lived object onto the stack, but that is an optimisation, not the rule. Strings in the string pool and `static` fields are heap objects referenced from class metadata.

Default thread stack is about 1 MB (`-Xss`); recursion depth of a few tens of thousands of frames is the ceiling, which is why deep DFS in Java is often rewritten iteratively.

## Generational collection

The hypothesis: most objects die young. So the heap is split:

```text
Young generation: Eden | Survivor 0 | Survivor 1    (minor GC, frequent, fast)
Old generation (tenured)                             (major/full GC, rarer, slower)
```

1. New objects are allocated in Eden (thread-local allocation buffers make this a pointer bump).
2. Eden fills: minor GC copies live objects to a survivor space, Eden is wiped. Dead objects cost nothing; the cost is proportional to *live* data.
3. Survivors ping-pong between S0/S1, with an age counter. After `MaxTenuringThreshold` copies (default 15, often lower in practice) the object is promoted to old.
4. Old fills: a major collection, which is where long pauses historically came from.

Large arrays can be allocated directly in old (or in G1 "humongous" regions). Promotion of objects that die right after is "premature promotion", a common cause of old-gen churn.

## GC roots and reachability

An object is garbage when it is not reachable from any GC root. Roots are:

- Local variables and operand stacks of every live thread frame.
- Static fields of loaded classes.
- Live threads themselves, JNI references, monitors held, system class loader.

Reference counting is not used, so cycles are collected fine. Reachability is what matters: a listener registered on a long-lived object is reachable through it, no matter how little you care about it. That is the definition of a Java leak: *reachable but unwanted*.

## The collectors in two sentences each

- **Serial**: single thread, stop-the-world, tiny footprint. Right for small containers and CLI tools; default when the JVM sees fewer than 2 CPUs or under 2 GB.
- **Parallel**: multiple threads for young and old, still stop-the-world, maximises throughput. Choose it for batch jobs where pauses do not matter but total CPU does.
- **G1** (default since Java 9): divides the heap into equal regions, collects the regions with the most garbage first ("garbage first"), and aims at a pause target (`-XX:MaxGCPauseMillis=200` by default) by collecting incrementally. Good general-purpose choice for heaps from a few GB to tens of GB.
- **ZGC** (production since 15, generational mode since 21 and the default mode from 23): concurrent marking, relocation and reference processing using coloured pointers and load barriers, so pauses stay under a millisecond regardless of heap size. Pay with some throughput and memory; pick it for latency-sensitive services with large heaps.
- **Shenandoah**: similar goals to ZGC (concurrent compaction, sub-10 ms pauses), from Red Hat; available in most OpenJDK builds.

The interview framing: *throughput vs latency vs footprint; pick two.* Mention that Java 21 added a generational mode to ZGC, which removed most of its throughput penalty.

## `OutOfMemoryError` kinds

| Message | Cause | First move |
|---|---|---|
| `Java heap space` | Live set exceeds `-Xmx`, or a leak | Heap dump on OOM, find the dominator |
| `GC overhead limit exceeded` | >98% of time in GC recovering <2% of heap | Same as above; the heap is effectively full |
| `Metaspace` | Class leak: dynamic proxies, redeploys, generated classes in a loop | Dump and count class loaders |
| `unable to create native thread` | Thread count hit OS/ulimit, or stacks ate native memory | Count threads; fix the unbounded executor |
| `Direct buffer memory` | Off-heap `ByteBuffer.allocateDirect` beyond `-XX:MaxDirectMemorySize` | Pool buffers; check Netty/NIO settings |
| `Requested array size exceeds VM limit` | Array larger than ~2^31 - 1 elements | Chunk it |

`OutOfMemoryError` is an `Error`, not an `Exception`; catching it is almost always wrong because the heap is still full.

## Leaks that actually happen in Java

1. **Static collections that only grow.** A `static Map<String, Session>` cache with no eviction. Fix: bounded cache (Caffeine, `LinkedHashMap` with `removeEldestEntry`), or weak values.
2. **Listeners and callbacks never unregistered.** The publisher is long-lived and holds the subscriber strongly. Fix: unregister in `close`, or weak listeners.
3. **`ThreadLocal` in pooled threads.** Pool threads live forever, so a `ThreadLocal` that is set and never `remove()`d keeps its value (and everything it references) for the thread's life. Fix: `try { ... } finally { tl.remove(); }`.
4. **Unclosed resources.** Streams, JDBC connections, `HttpClient` responses, file handles. The heap object may be collected eventually, but the native handle leaks until finalization. Fix: try-with-resources, always.
5. **Inner classes capturing `this`.** A non-static inner class or anonymous class holds an implicit reference to the enclosing instance. Fix: static nested classes, lambdas (which capture only what they use).
6. **`String.substring` / `intern` in old lore**: no longer leaks since Java 7u6; mention it only to say it is fixed.
7. **Unbounded queues in executors.** `Executors.newFixedThreadPool` uses an unbounded `LinkedBlockingQueue`; a producer faster than consumers is a heap leak with extra steps. Fix: bounded queue with a rejection policy.
8. **Caches keyed by objects with broken `equals`/`hashCode`.** Every lookup misses and inserts. Fix the contract.

## Reference types

```java
WeakReference<Image> ref = new WeakReference<>(image);
Image img = ref.get();            // null once the collector has cleared it
```

- **Strong**: ordinary references; the object survives while reachable.
- **Soft**: cleared only when memory is tight; a hint for caches, but behaviour is unpredictable so production caches use explicit bounds instead.
- **Weak**: cleared at the next GC once no strong refs remain. `WeakHashMap` keys are weak: the entry disappears when the key is collected elsewhere. Used for canonicalising maps and listener lists.
- **Phantom**: enqueued after the object is finalised, used with `ReferenceQueue` for cleanup. Prefer `java.lang.ref.Cleaner` (Java 9+) over `finalize()`, which is deprecated for removal.

## Sizing flags you should recognise

```bash
java -Xms2g -Xmx2g -Xss512k \
     -XX:+UseG1GC -XX:MaxGCPauseMillis=100 \
     -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/dumps \
     -Xlog:gc*:file=gc.log \
     -XX:MaxRAMPercentage=75.0 \
     -jar app.jar
```

- `-Xms` initial heap, `-Xmx` maximum heap. Set them equal in containers so the JVM does not spend time growing and the orchestrator's limit is predictable.
- `-XX:MaxRAMPercentage` sizes the heap as a fraction of the container's memory limit (the JVM is container-aware since 10). Leave headroom for metaspace, threads and off-heap, which is why 75% not 100%.
- `-Xss` per-thread stack; matters when you have thousands of platform threads.
- `-XX:+HeapDumpOnOutOfMemoryError` costs nothing until it saves your week.
- `-Xlog:gc*` is the unified logging switch (Java 9+); old `-XX:+PrintGCDetails` is gone.

## Reading a heap dump

Take one with `jcmd <pid> GC.heap_dump /tmp/h.hprof` (or `jmap -dump:live,format=b,file=...`), open it in Eclipse MAT or VisualVM, and go straight to the *dominator tree* sorted by retained size: the top entries are the objects that, if freed, would release the most memory, and the path from a GC root to them (right-click, "path to GC roots", excluding weak/soft refs) names the field that holds the leak. The "Leak Suspects" report in MAT automates this and is usually right. Compare two dumps taken minutes apart to confirm growth, and check thread count and class-loader count in the same dump for the non-heap OOM kinds.

## `final`, `static` and class loading

- `static` fields belong to the class, live in the heap referenced from the class's metadata, and are GC roots. `static` methods cannot touch instance state. There is no `static` class at top level; a `static` nested class is just one that does not capture the outer instance.
- `final` on a variable means assigned exactly once; on a method, not overridable; on a class, not extendable. `final` does not make the referenced object immutable. `final` fields have a special guarantee in the memory model: once the constructor finishes, every thread sees the field's value without synchronisation (covered in the concurrency track).
- Class loading is lazy and happens in three steps: loading (bytes to `Class` object), linking (verification, preparation of statics to defaults, resolution) and initialisation (static initialisers run, in textual order, exactly once, under a lock). Initialisation is triggered by `new`, static method call, static field access (non-constant), `Class.forName`, or a subclass initialising.
- Loaders delegate parent-first: bootstrap (core modules) to platform to application (classpath/module path). Two loaders loading the same bytes produce two distinct classes; that is how redeploys leak metaspace and why `instanceof` can surprisingly fail across loaders.
- `static final` compile-time constants (primitives and `String` literals) are inlined into call sites by `javac`; changing the constant without recompiling callers leaves stale values. Known as the constant inlining trap.

## Common interview questions

**What is the difference between stack and heap memory?** Each thread has a stack of frames holding locals and references, freed automatically on return and limited by `-Xss`. The heap holds every object, is shared by all threads, and is reclaimed by the garbage collector. Running out gives `StackOverflowError` versus `OutOfMemoryError`.

**How does the garbage collector decide what to free?** It traces from GC roots (thread stacks, static fields, JNI handles) and anything not reached is garbage, so cycles are not a problem. Generational collectors do this cheaply for the young generation by copying only live objects out of Eden.

**Can Java leak memory?** Yes: an object that is reachable but no longer needed. Typical culprits are static caches without eviction, listeners never unregistered, `ThreadLocal`s on pooled threads, unclosed resources and unbounded queues. The fix is always to remove the reference or bound the structure.

**How would you debug an `OutOfMemoryError` in production?** Run with `-XX:+HeapDumpOnOutOfMemoryError`, open the dump in MAT, sort the dominator tree by retained size and follow the path to GC roots. Confirm with GC logs showing old-gen rising across collections, and check whether it is heap, metaspace or native by the error message.

**G1 vs ZGC?** G1 is region-based and pause-targeted; it does most work concurrently but still stops the world for evacuation, with pauses typically tens to hundreds of milliseconds. ZGC does marking and compaction concurrently with sub-millisecond pauses and scales to terabyte heaps, costing some throughput; Java 21 added a generational mode, which narrowed that gap.

**What does `volatile` or `final` have to do with memory?** `final` fields are guaranteed visible to all threads after construction; `volatile` writes are visible to subsequent reads across threads. Neither affects where the object is allocated.

**What is `-Xmx` and how do you size it in a container?** Maximum heap. Prefer `-XX:MaxRAMPercentage` so the heap scales with the container limit, leave 25% or more for metaspace, threads and direct memory, and set `-Xms` equal to avoid resize pauses.

**What is a `WeakReference` for?** A reference that does not keep its target alive; `get()` returns null once collected. Use for caches of derivable data, canonical maps (`WeakHashMap`) and listener registries where the lifetime should follow the referent, not the registry.

## Pitfalls

- Tuning GC flags before measuring; most services run well on defaults with a correctly sized heap.
- Calling `System.gc()` in application code.
- Static collections and caches without eviction, the most common real leak.
- `ThreadLocal` values never removed in thread pools.
- Reading heap usage from the operating system's view instead of GC logs and heap dumps.

## Key takeaways

- Objects live on the heap and die when unreachable from GC roots; stacks hold per-thread frames.
- Generational collection makes short-lived objects cheap; long-lived churn is expensive.
- G1 is the default; ZGC targets sub-millisecond pauses on large heaps.
- Diagnose `OutOfMemoryError` by its kind, then with heap dumps and the dominator tree.
- Most leaks are unbounded caches, static maps, listeners and thread-locals.
