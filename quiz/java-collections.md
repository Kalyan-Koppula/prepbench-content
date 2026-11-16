---
title: Collections and Memory
order: 3
module: java-collections
summary: HashMap internals, choosing implementations, ordering guarantees, immutability, streams collectors, and JVM memory and GC essentials.
---

## Why must a HashMap key be effectively immutable?

The bucket is chosen from `hashCode()` when the entry is inserted. If the key's hashed state changes afterwards, lookups compute a different bucket, so the entry becomes unreachable while `size()` still counts it.

## What does `ConcurrentModificationException` actually detect?

A structural modification of a collection while an iterator over it is live, detected by comparing a `modCount` snapshot. It is a best-effort bug detector, usually a single-threaded loop that removes from the collection it is iterating; fix with `Iterator.remove` or `removeIf`.

## Walk me through what happens on `HashMap.put`.

Compute `hashCode`, spread it with `h ^ (h >>> 16)`, mask to a bucket with `(n - 1) & hash`, then walk the bucket comparing hash and `equals`. Replace the value if the key exists, else append a node; treeify the bucket at 8 entries if the table has 64 or more buckets; resize when size exceeds capacity times 0.75.

## Why does `HashMap` keep its table size a power of two?

So the bucket index is a bitmask (`hash & (n - 1)`) rather than a modulo, and so a resize can split each bucket into exactly two destinations (`i` and `i + oldCapacity`) using one extra hash bit without recomputing hashes.

## What happens if you override `equals` but not `hashCode`?

Two objects that are equal can land in different buckets, so a `HashMap.get` with an equal key misses and a `HashSet` accepts duplicates. The contract is: equal objects must have equal hash codes.

## When does a `HashMap` bucket become a tree, and why?

When a bucket already holding 8 nodes receives another and the table has at least 64 buckets, it converts to a red-black tree so that pathological collisions degrade lookups to O(log n) instead of O(n). It reverts to a list when it shrinks to 6.

## What does the load factor control?

The fill ratio at which the table resizes: with 0.75 and 16 buckets, the 13th entry triggers doubling. Lower means fewer collisions but more memory; 0.75 is the measured compromise. Presize with the expected count to avoid repeated O(n) resizes.

## How would you implement an LRU cache in Java?

A `LinkedHashMap` constructed with `accessOrder = true` and `removeEldestEntry` returning `size() > capacity`. Every `get` moves the entry to the tail and the head is evicted on insert. Without it: `HashMap` plus a hand-rolled doubly linked list, O(1) each.

## How does `TreeMap` decide two keys are equal?

Only by `compareTo` or the supplied `Comparator` returning 0; it never calls `equals`. A comparator that collapses distinct keys silently merges them. Null keys are rejected because they cannot be compared.

## When do you reach for `TreeMap` instead of `HashMap`?

When you need sorted iteration or nearest-key queries: `floorKey`, `ceilingEntry`, `headMap`, `tailMap`, `subMap`. Interval scheduling, time-based lookups and "closest value" problems are the usual triggers. Cost is O(log n) per operation.

## Why is `LinkedList` almost never the right choice?

Each element is a separate node with three references, so it is memory-heavy and cache-hostile, and `get(i)` is O(n). Its O(1) insert needs an iterator already at the position. `ArrayList` for lists, `ArrayDeque` for stacks and queues beat it in practice.

## What is wrong with using `ArrayList.remove(0)` as a queue?

Every removal shifts all remaining elements left with `System.arraycopy`, so draining n elements costs O(n²). Use `ArrayDeque.poll()`, which is O(1) on a ring buffer.

## Why should you not use `java.util.Stack`?

It extends `Vector`, so every method is synchronised, and it exposes indexed access that breaks the LIFO contract. The `Stack` Javadoc itself recommends `Deque<T> s = new ArrayDeque<>()`.

## Can you iterate a `PriorityQueue` in sorted order?

No. Iteration walks the heap array, which is only partially ordered. Only `peek` and `poll` observe the ordering; to consume in order, `poll` until empty, which costs O(n log n).

## How do you find the k largest elements of n items efficiently?

Keep a min-heap of size k: offer each element and poll the minimum whenever the size exceeds k. O(n log k) time, O(k) space, and the heap contains the answer at the end.

## What is the difference between `List.of(...)` and `Collections.unmodifiableList(...)`?

`List.of` creates an immutable list that rejects nulls. `unmodifiableList` is a read-only view over the original, so later mutations of the original show through it. `List.copyOf` is the immutable snapshot of an existing list.

## What does `Arrays.asList` return and what is the trap?

A fixed-size list backed by the array: `set` writes through, `add` and `remove` throw `UnsupportedOperationException`. Passing an `int[]` gives a one-element `List<int[]>` because primitives do not autobox into generics.

## Does `HashMap` preserve insertion order?

No, and the order can change after a resize. `LinkedHashMap` preserves insertion (or access) order, `TreeMap` sorts by key. JS `Map` always preserves insertion order, which is the habit to unlearn.

## What is the difference between a fail-fast and a weakly consistent iterator?

Fail-fast (`java.util`) throws `ConcurrentModificationException` when it detects structural change by anyone else. Weakly consistent (`java.util.concurrent`) never throws and reflects some or all concurrent updates; `CopyOnWriteArrayList` iterates a snapshot.

## What does `subList` return and what can go wrong?

A live view of a range of the parent list. Writes through it modify the parent, and a structural change to the parent invalidates the view (`ConcurrentModificationException`). `subList(a, b).clear()` is the standard range-delete idiom.

## `list.remove(1)` on a `List<Integer>`: what gets removed?

The element at index 1, because `remove(int)` is a more specific overload than `remove(Object)`. To remove the value 1, call `list.remove(Integer.valueOf(1))`.

## How do you group a list by a field and count each group with streams?

`collect(Collectors.groupingBy(T::field, Collectors.counting()))`, which gives `Map<Field, Long>`. Swap `counting()` for `summingDouble`, `mapping` or `maxBy` for other aggregates.

## Why did `Collectors.toMap` throw `IllegalStateException`?

Two elements mapped to the same key and no merge function was provided. Pass a third argument such as `(a, b) -> a` or `Integer::sum`, and a fourth for the map type if you need ordering.

## What is the difference between `map` and `flatMap` on a stream?

`map` is one-to-one. `flatMap` maps each element to a stream and concatenates them, flattening `Stream<List<T>>` to `Stream<T>`; same semantics as JS `flatMap`.

## When do stream intermediate operations execute?

Only when a terminal operation such as `collect`, `forEach`, `count` or `findFirst` runs. They are lazy and fused into one pass, and short-circuiting terminals stop as early as possible. A stream can be consumed only once.

## When would you avoid streams in favour of a loop?

When the body mutates local state or needs early exit on complex conditions, when it throws checked exceptions, when you need the index, or in a hot path where the loop measures faster. Readability is the stream's benefit, not speed.

## What lives on the stack and what lives on the heap?

Each thread's stack holds frames with locals, primitives and references; it is freed on return and limited by `-Xss`. Every object and array lives on the shared heap and is reclaimed by the garbage collector. Exhausting them gives `StackOverflowError` and `OutOfMemoryError` respectively.

## How does the GC decide an object is garbage?

It traces reachability from GC roots: thread stacks, static fields, JNI references. Anything not reached is garbage, so cycles are collected fine. There is no reference counting.

## Why is the heap split into young and old generations?

Because most objects die young. The young generation is collected often by copying only the live objects out of Eden, which is cheap; survivors that live long enough are promoted to the old generation, collected rarely and more expensively.

## Describe G1 and ZGC in one sentence each.

G1 divides the heap into regions, collects the garbage-richest ones first and aims at a pause target, with short stop-the-world evacuation pauses. ZGC marks and compacts concurrently using coloured pointers and load barriers for sub-millisecond pauses on very large heaps, with a generational mode since Java 21 (default from 23).

## What are the common causes of memory leaks in Java?

Static collections that grow without eviction, listeners never unregistered, `ThreadLocal` values not removed on pooled threads, unclosed resources, non-static inner classes holding the outer instance, and unbounded executor queues. A leak means reachable-but-unwanted.

## How would you investigate an `OutOfMemoryError: Java heap space`?

Run with `-XX:+HeapDumpOnOutOfMemoryError`, open the dump in Eclipse MAT, sort the dominator tree by retained size and follow the path to GC roots for the top entry. Confirm with GC logs showing old-gen usage climbing across collections.

## What is a `WeakReference` for?

A reference that does not keep its target alive; `get()` returns null once the collector has cleared it. Used for caches of derivable data, `WeakHashMap` canonical maps and listener registries whose entries should die with the referent.

## What do `-Xmx` and `-Xms` set, and how do you size them in a container?

Maximum and initial heap. In containers prefer `-XX:MaxRAMPercentage` (around 75%) so the heap follows the memory limit while leaving room for metaspace, threads and direct buffers, and set `-Xms` equal to `-Xmx` to avoid resize pauses.

## Why does `ThreadLocal` leak memory in a thread pool?

Pool threads never die, so a value set on a `ThreadLocal` and never removed stays reachable through the thread for its whole life, along with everything it references. Always `remove()` in a `finally` block.

