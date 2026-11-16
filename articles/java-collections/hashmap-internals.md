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

## Common interview questions

**Walk me through `HashMap.get`.** Compute and spread `hashCode`, mask it to a bucket index, then walk that bucket comparing stored hash first and `equals` second. Return the matching node's value or null. Expected O(1) because buckets stay short while the load factor holds.

**What happens when two keys have the same `hashCode`?** They land in the same bucket and are chained in a linked list; `equals` distinguishes them. Once a bucket holds 8 entries and another is added, in a table of at least 64 buckets, it becomes a red-black tree, so even pathological collisions cost O(log n) rather than O(n).

**Why is the table length a power of two?** So the bucket index is `hash & (n - 1)`, a single AND, and so a resize splits each bucket into exactly two (`i` and `i + oldCap`) using one extra hash bit, with no need to recompute hashes.

**Why does `HashMap` spread the hash with `h ^ (h >>> 16)`?** Because masking with `n - 1` only uses the low bits. Objects whose hash codes differ mostly in the high bits (common with `Float`, or aligned memory addresses) would all collide; XOR-ing the high half into the low half keeps the distribution reasonable cheaply.

**What is the cost of resize and when does it happen?** When `size` exceeds `capacity * loadFactor` (16 * 0.75 = 12 by default). The table doubles and every entry is redistributed: O(n) once, amortised O(1) per insert. Presize when you know the count.

**Can a `HashMap` have a null key?** One null key (stored in bucket 0) and any number of null values. `ConcurrentHashMap`, `TreeMap` and `Map.of` all reject null keys; `ConcurrentHashMap` rejects null values too, because `get` returning null must mean "absent".

**How would you implement an LRU cache?** `LinkedHashMap` in access-order mode with `removeEldestEntry` returning `size() > capacity`. Without it: a `HashMap` from key to a node in a hand-written doubly linked list, moving a node to the tail on access and dropping the head on eviction, all O(1).

**`HashMap` vs `TreeMap` vs `LinkedHashMap` in one sentence each.** `HashMap`: O(1), no order, the default. `TreeMap`: O(log n), sorted keys, range and nearest-key queries. `LinkedHashMap`: O(1), insertion or access order, cheap LRU.
