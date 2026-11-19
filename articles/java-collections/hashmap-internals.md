---
title: HashMap Internals
order: 2
summary: Buckets, hash spreading, load factor and resize, treeification, the equals/hashCode contract, why mutable keys break lookups, and the LinkedHashMap and TreeMap variants interviewers ask about next.
---

"How does `HashMap` work?" is the single most asked Java collections question, and the follow-ups ("what happens on resize?", "what if two keys collide?", "why must you override both `equals` and `hashCode`?") are where candidates stall. Know the lifecycle of one `put` and one `get` and you can answer all of them.

## The data structure

```text
table: Node<K,V>[]  (length is always a power of two, default 16)

index 0  → null
index 1  → [k1,v1] → [k7,v7]           linked list (collisions)
index 2  → TreeNode (red-black tree)   when a bucket gets long
...
```

Each `Node` holds `hash`, `key`, `value`, `next`. The map also keeps `size`, `threshold = capacity * loadFactor` and `modCount` for fail-fast iterators.

## One `put`, step by step

```java
map.put(key, value);
```

1. `h = key.hashCode()`, then spread it: `h ^ (h >>> 16)`. This folds the high bits into the low bits, because step 2 only looks at the low bits.
2. Bucket index is `(n - 1) & hash` where `n` is the table length. A power-of-two length makes this a cheap mask instead of a modulo.
3. Empty bucket: create a node. Otherwise walk the chain comparing `hash == node.hash && (key == node.key || key.equals(node.key))`. Equal key found: replace the value and return the old one. Not found: append a node.
4. If the bucket already holds 8 nodes when another arrives *and* the table has at least 64 buckets, the bucket converts to a red-black tree (treeification). Below 64 buckets it resizes instead. A tree bucket shrinks back to a list at 6.
5. `++size > threshold` triggers `resize()`: double the table and redistribute every node. Because the length doubled, each node either stays at index `i` or moves to `i + oldCapacity`, decided by one bit of the hash. No rehashing of keys is needed.

`get` is steps 1 to 3 without the insert. Expected cost is O(1); worst case is O(log n) in a tree bucket, O(n) in a list bucket of keys that collide but are not `Comparable`.

Null is a legal key: it always lives in bucket 0.

## Load factor and capacity

- Default capacity 16, load factor 0.75, so the first resize happens at 17 entries.
- A lower load factor trades memory for fewer collisions; 0.75 is the measured sweet spot between space and lookup cost.
- If you know the size up front, presize: `new HashMap<>(expectedSize / 0.75f + 1)` or `HashMap.newHashMap(expectedSize)` (Java 19+). Avoids repeated resizes, each O(n).
- Resize is not atomic. In pre-Java-8 `HashMap`, concurrent resizing could create a cycle in a chain and spin `get` forever; today the symptom is lost updates and `ConcurrentModificationException`. Either way: use `ConcurrentHashMap` for shared maps.

## The `equals`/`hashCode` contract

The rule interviewers want verbatim: *if `a.equals(b)` then `a.hashCode() == b.hashCode()`*. The converse is not required (collisions are fine).

```java
public final class Point {
    private final int x, y;
    public Point(int x, int y) { this.x = x; this.y = y; }

    @Override public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Point p)) return false;
        return x == p.x && y == p.y;
    }
    @Override public int hashCode() { return Objects.hash(x, y); }
}

// Or just:
public record Point(int x, int y) {}
```

What breaks when you get it wrong:

- Override `equals` only: two "equal" keys hash to different buckets, so `map.get(new Point(1, 2))` misses an entry stored under an equal point. Duplicates appear in `HashSet`.
- Override `hashCode` to return a constant: still correct, but every key lands in one bucket and the map degrades to a linked list or tree.
- Use fields in `hashCode` that are not in `equals` (or vice versa): contract violation, same symptoms as the first case.
- JS contrast: `Map` keys are compared by `SameValueZero`, so two different object literals are always different keys. Java gives you value-based keys for free once `equals`/`hashCode` are right.

## Why mutable keys break the map

```java
Set<List<Integer>> seen = new HashSet<>();
List<Integer> key = new ArrayList<>(List.of(1, 2));
seen.add(key);
key.add(3);
seen.contains(key);        // false: hash now points at another bucket
seen.contains(List.of(1, 2)); // false too: the node's stored hash is stale and equals fails
seen.size();               // 1: the entry is orphaned
```

The bucket was chosen from the hash at insertion time. Change the hashed state and the entry becomes unreachable yet still counted. Keys should be immutable in the fields that feed `hashCode`: strings, boxed primitives, records, enums.

## `HashSet` is a `HashMap`

`HashSet<E>` wraps a `HashMap<E, Object>` and stores every element as a key against a shared dummy value. That is why it has identical complexity, identical null handling (one null allowed) and the same iteration-order caveats. `LinkedHashSet` wraps a `LinkedHashMap`, `TreeSet` wraps a `TreeMap`.

## `LinkedHashMap`: ordered, and an LRU cache for free

A `HashMap` whose entries are also threaded through a doubly linked list. Lookups are still O(1); iteration follows the list.

- Default: insertion order. Re-inserting an existing key does not move it.
- `new LinkedHashMap<>(cap, 0.75f, true)`: access order. Every `get`/`put` moves the entry to the tail.
- `removeEldestEntry` is invoked after every insert; return true to evict the head.

```java
class LruCache<K, V> extends LinkedHashMap<K, V> {
    private final int capacity;
    LruCache(int capacity) {
        super(16, 0.75f, true);        // accessOrder = true
        this.capacity = capacity;
    }
    @Override protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
        return size() > capacity;
    }
}
```

Not thread-safe; the follow-up is always "how would you make it so" (wrap with a lock, or `Collections.synchronizedMap`, or `Caffeine` in production).

## `TreeMap` and `NavigableMap`

Red-black tree keyed by `Comparable` or a `Comparator`. All operations O(log n). Keys may not be null (there is nothing to compare against). Equality is decided by the comparator, never by `equals`.

```java
TreeMap<Integer, String> prices = new TreeMap<>();
prices.put(100, "basic"); prices.put(250, "plus"); prices.put(900, "pro");

prices.floorKey(300);          // 250: greatest key <= 300
prices.ceilingEntry(300);      // 900=pro: least key >= 300
prices.higherKey(250);         // 900 (strictly greater); lowerKey is the mirror
prices.firstKey();             // 100
prices.pollLastEntry();        // removes and returns 900=pro
prices.headMap(250);           // keys < 250, live view
prices.tailMap(250, true);     // keys >= 250, live view
prices.subMap(100, true, 250, false);
prices.descendingMap();        // reverse-order view
```

The interview triggers for `TreeMap`: "nearest value", "range query", "sorted by key", "interval scheduling", "calendar booking", "time-based key-value store". `TreeSet` has the same methods on elements (`floor`, `ceiling`, `headSet`, `subSet`).

## Java 8+ map API worth using live

```java
Map<String, Integer> counts = new HashMap<>();
counts.merge(word, 1, Integer::sum);                     // frequency count
counts.computeIfAbsent(word, k -> 0);                    // init-if-missing
counts.getOrDefault(word, 0);
counts.putIfAbsent(word, 0);
Map<String, List<String>> groups = new HashMap<>();
groups.computeIfAbsent(key, k -> new ArrayList<>()).add(value);  // multimap idiom
counts.entrySet().removeIf(e -> e.getValue() == 0);
```

`compute*` and `merge` on a plain `HashMap` are not atomic; on `ConcurrentHashMap` they are.

## Worked example: tracing collisions and a resize

Use a tiny `HashMap` with capacity 4 (the real minimum is 16, but the mechanics are the same) and keys whose hash codes are known.

1. `put("A", 1)`: hash spreads to some value; `index = hash & (capacity - 1)` gives bucket 1. Bucket 1 is empty, so a node is stored there.
2. `put("E", 5)`: suppose its index is also 1. The bucket's first node has a different key (`equals` is false), so the new node is appended to bucket 1's chain.
3. `put("A", 10)`: index 1 again; walking the chain finds a node whose hash matches **and** whose key `equals` `"A"`, so its value is replaced. Size stays 2.
4. `put("C", 3)`: bucket 3, size 3. The threshold is `capacity × loadFactor = 4 × 0.75 = 3`, so the map **resizes** to capacity 8.

During the resize, each node either stays at its index or moves to `index + oldCapacity`, depending on one extra bit of its hash. No hash codes are recomputed, which makes resizing a single linear pass. This is why capacities are powers of two: `hash & (capacity − 1)` is a cheap modulo, and the split on resize is one bit.

If a single bucket's chain grows beyond 8 nodes (and the table has at least 64 buckets), it is converted to a red-black tree, turning worst-case lookups in that bucket from `O(n)` to `O(log n)`. This protects against poor hash functions and deliberate collision attacks.

## Why the hash is "spread"

`HashMap` doesn't use `key.hashCode()` directly; it computes `h ^ (h >>> 16)`. With small tables only the low bits select the bucket, so hash codes that differ only in their high bits (common for some numeric keys and floats) would all collide. XORing the high half into the low half lets those bits influence the bucket choice at almost no cost.

## Pre-sizing

If you know you'll insert about 10,000 entries, create the map with enough capacity to avoid repeated resizes:

```java
Map<String, Order> byId = HashMap.newHashMap(10_000); // Java 19+: sizes for 10,000 entries at load factor 0.75
// before Java 19: new HashMap<>((int) (10_000 / 0.75f) + 1)
```

`new HashMap<>(10_000)` sets the **capacity**, not the number of entries, so it would still resize once at 7,500 entries.

## `ConcurrentHashMap` in brief

`HashMap` isn't thread-safe: concurrent puts can lose entries, and before Java 8 a concurrent resize could even create a cycle in a chain. `ConcurrentHashMap`:

- Uses the same array-of-bins design, but locks only the **single bin** being modified (and uses compare-and-swap for empty bins), so writers to different bins don't block each other.
- Reads take no lock at all.
- Provides atomic compound operations: `computeIfAbsent`, `merge`, `compute`. Use these instead of `get`-then-`put`, which is a race.

```java
ConcurrentHashMap<String, LongAdder> hits = new ConcurrentHashMap<>();
hits.computeIfAbsent(path, p -> new LongAdder()).increment(); // atomic and contention-friendly
```

## Common interview questions

**Walk me through `HashMap.get`.** Compute and spread `hashCode`, mask it to a bucket index, then walk that bucket comparing stored hash first and `equals` second. Return the matching node's value or null. Expected O(1) because buckets stay short while the load factor holds.

**What happens when two keys have the same `hashCode`?** They land in the same bucket and are chained in a linked list; `equals` distinguishes them. Once a bucket holds 8 entries and another is added, in a table of at least 64 buckets, it becomes a red-black tree, so even pathological collisions cost O(log n) rather than O(n).

**Why is the table length a power of two?** So the bucket index is `hash & (n - 1)`, a single AND, and so a resize splits each bucket into exactly two (`i` and `i + oldCap`) using one extra hash bit, with no need to recompute hashes.

**Why does `HashMap` spread the hash with `h ^ (h >>> 16)`?** Because masking with `n - 1` only uses the low bits. Objects whose hash codes differ mostly in the high bits (common with `Float`, or aligned memory addresses) would all collide; XOR-ing the high half into the low half keeps the distribution reasonable cheaply.

**What is the cost of resize and when does it happen?** When `size` exceeds `capacity * loadFactor` (16 * 0.75 = 12 by default). The table doubles and every entry is redistributed: O(n) once, amortised O(1) per insert. Presize when you know the count.

**Can a `HashMap` have a null key?** One null key (stored in bucket 0) and any number of null values. `ConcurrentHashMap`, `TreeMap` and `Map.of` all reject null keys; `ConcurrentHashMap` rejects null values too, because `get` returning null must mean "absent".

**How would you implement an LRU cache?** `LinkedHashMap` in access-order mode with `removeEldestEntry` returning `size() > capacity`. Without it: a `HashMap` from key to a node in a hand-written doubly linked list, moving a node to the tail on access and dropping the head on eviction, all O(1).

**`HashMap` vs `TreeMap` vs `LinkedHashMap` in one sentence each.** `HashMap`: O(1), no order, the default. `TreeMap`: O(log n), sorted keys, range and nearest-key queries. `LinkedHashMap`: O(1), insertion or access order, cheap LRU.

## Pitfalls

- Mutable keys whose `hashCode` changes after insertion.
- `equals` overridden without `hashCode` (or vice versa).
- Assuming iteration order, or that `new HashMap<>(n)` holds `n` entries without resizing.
- `get`-check-`put` sequences on shared maps instead of `computeIfAbsent` or `merge`.
- Using `Hashtable` or `Collections.synchronizedMap` where `ConcurrentHashMap` scales far better.

## Key takeaways

- A `HashMap` is an array of buckets; `hash & (capacity − 1)` picks the bucket, `equals` finds the key within it.
- It resizes (doubling) when size exceeds capacity × 0.75; nodes split between two buckets by one hash bit.
- Long chains become red-black trees, bounding worst-case lookups at `O(log n)`.
- Keys must have consistent `equals`/`hashCode` and must not change while in the map.
- Use `ConcurrentHashMap` and its atomic methods for shared maps.
