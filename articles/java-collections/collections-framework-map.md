---
title: The Collections Framework Map
order: 1
summary: The interface hierarchy, a decision table for which implementation fits which access pattern, immutable factories, the Arrays.asList trap, and what iteration order each collection promises.
---

In JavaScript you get `Array`, `Map`, `Set` and that's roughly it. Java gives you a dozen implementations behind a handful of interfaces, and interviewers use "which one would you pick and why" as a quick test of whether you understand the access pattern behind the API. The point is never the class name; it is the complexity and the ordering guarantee.

## The hierarchy worth memorising

```text
Iterable
└── Collection
    ├── List        ArrayList, LinkedList, (Vector, Stack: legacy)
    ├── Set         HashSet, LinkedHashSet
    │   └── SortedSet → NavigableSet   TreeSet
    └── Queue       PriorityQueue, LinkedList
        └── Deque   ArrayDeque, LinkedList

Map (not a Collection)   HashMap, LinkedHashMap, (Hashtable: legacy)
└── SortedMap → NavigableMap   TreeMap
```

Three things to say about it out loud:

- `Map` is deliberately outside `Collection`: a map is a set of entries, not a bag of elements. You iterate `map.entrySet()`, `keySet()` or `values()`, each a live view.
- Code against the interface (`List<String> xs = new ArrayList<>()`), choose the implementation at the one place it is constructed. This is what lets you swap `ArrayList` for `CopyOnWriteArrayList` without touching callers.
- The `Collections` class (plural) is the utility bag: `sort`, `unmodifiableList`, `synchronizedMap`, `emptyList`, `reverse`, `frequency`, `nCopies`. `Collection` (singular) is the interface.

## Which implementation for which access pattern

| You need | Pick | Why |
|---|---|---|
| Index access, append, iterate | `ArrayList` | O(1) `get`/`set`, amortised O(1) `add` at the end; cache-friendly |
| Insert/remove at both ends (stack, queue) | `ArrayDeque` | Ring buffer, no node allocation; beats `LinkedList` and the legacy `Stack` |
| Insert/remove in the middle by position | `ArrayList` anyway | `LinkedList` is O(n) to *find* the position; the O(1) unlink rarely wins |
| Membership test, no order | `HashSet` | O(1) expected `contains`; backed by a `HashMap` |
| Membership plus insertion order | `LinkedHashSet` | Hash lookup plus a doubly linked list threading the entries |
| Sorted elements, range queries, floor/ceiling | `TreeSet` | Red-black tree, O(log n) everything, `NavigableSet` methods |
| Key to value, no order | `HashMap` | O(1) expected; the default map |
| Key to value, predictable iteration | `LinkedHashMap` | Insertion order, or access order for LRU caches |
| Key to value, sorted keys, "nearest key" queries | `TreeMap` | `floorKey`, `ceilingEntry`, `subMap`, `firstKey` |
| Smallest/largest next | `PriorityQueue` | Binary heap, O(log n) `offer`/`poll`, O(1) `peek` |
| Enum keys or elements | `EnumMap` / `EnumSet` | Array/bitset backed, faster and smaller than hash versions |
| Shared across threads | `ConcurrentHashMap`, `CopyOnWriteArrayList`, `ConcurrentLinkedQueue`, blocking queues | Covered in the concurrency track |

The one-liner interviewers want: *hash for speed, tree for order, linked-hash for history, array-backed for everything linear.*

## Immutable collections: `List.of`, `Set.of`, `Map.of`

Java 9+ factories return truly immutable collections; mutators throw `UnsupportedOperationException`.

```java
List<String> langs = List.of("java", "kotlin");
Set<Integer> primes = Set.of(2, 3, 5);
Map<String, Integer> ports = Map.of("http", 80, "https", 443);
Map<String, Integer> many = Map.ofEntries(Map.entry("a", 1), Map.entry("b", 2)); // more than 10 pairs

List<String> snapshot = List.copyOf(someMutableList);   // defensive copy, immutable
```

Rules that differ from JS `Object.freeze`:

- They reject `null` elements and keys (`NullPointerException` at construction).
- `Set.of` and `Map.of` throw `IllegalArgumentException` on duplicate elements/keys.
- Iteration order of `Set.of`/`Map.of` is unspecified and deliberately randomised per JVM run, so tests that depend on it are flaky by design.
- Immutability is shallow: the collection cannot change, the objects inside can.
- `Collections.unmodifiableList(xs)` is a read-only *view* of `xs`: changes to `xs` show through it. `List.copyOf(xs)` is a snapshot.

## The `Arrays.asList` trap

```java
List<Integer> a = Arrays.asList(1, 2, 3);
a.set(0, 99);     // fine: writes through to the backing array
a.add(4);         // UnsupportedOperationException: fixed size, not immutable

int[] nums = {1, 2, 3};
List<int[]> oops = Arrays.asList(nums);   // one element: the array itself (no autoboxing of int[])
List<Integer> ok = Arrays.stream(nums).boxed().toList();
```

`Arrays.asList` is a fixed-size view over the array: `set` works, `add`/`remove` throw. Wrap it in `new ArrayList<>(...)` when you need a growable copy, and remember that `Stream.toList()` (Java 16+) returns an unmodifiable list while `Collectors.toList()` makes no promise either way (in practice an `ArrayList`).

## Iteration order guarantees

| Collection | Order |
|---|---|
| `ArrayList`, `LinkedList`, `ArrayDeque` | Positional |
| `HashMap`, `HashSet` | None; can change after a resize. Never rely on it |
| `LinkedHashMap`, `LinkedHashSet` | Insertion (or access order if constructed with `accessOrder = true`) |
| `TreeMap`, `TreeSet` | Sorted by `Comparable` or the supplied `Comparator` |
| `PriorityQueue` | Only `poll`/`peek` are ordered; iterating gives heap layout, not sorted order |
| `List.of`, `Set.of`, `Map.of` | List: positional. Set/Map: unspecified and randomised |

JS `Map` and `Set` always preserve insertion order; Java's hash versions do not. If you port JS code that depended on that, reach for `LinkedHashMap`.

## Fail-fast vs fail-safe iterators

```java
List<String> xs = new ArrayList<>(List.of("a", "b", "c"));
for (String s : xs) {
    if (s.equals("b")) xs.remove(s);   // ConcurrentModificationException on the next iteration step
}

// Correct options
xs.removeIf(s -> s.equals("b"));
for (Iterator<String> it = xs.iterator(); it.hasNext();) {
    if (it.next().equals("b")) it.remove();
}
```

- `java.util` collections are *fail-fast*: the iterator records a `modCount` at creation and throws `ConcurrentModificationException` if the collection was structurally modified by anything other than the iterator itself. It is best-effort detection of a bug, not a thread-safety mechanism, and the exception is not guaranteed under real concurrent access.
- `java.util.concurrent` collections are *weakly consistent* (often called fail-safe): `ConcurrentHashMap` iterators reflect some or all updates made after creation and never throw; `CopyOnWriteArrayList` iterates a snapshot of the array at iterator creation, so it never sees later writes.
- The well-known quirk: removing the second-to-last element in a for-each loop does not throw, because `hasNext()` returns false before `next()` gets a chance to check `modCount`.

## `equals`, `hashCode`, `Comparable`: the contracts collections rely on

- `HashMap`/`HashSet` locate elements by `hashCode()` then confirm with `equals()`. Override both together, on the same fields. Records do this for you.
- `TreeMap`/`TreeSet` ignore `equals` entirely and use `compareTo`/`Comparator`. A comparator that returns 0 for two "different" elements makes the set treat them as duplicates.
- `List.contains`, `indexOf`, `remove(Object)` use `equals` and are O(n).
- `List<Integer>.remove(int index)` versus `remove(Object o)`: `list.remove(1)` removes index 1; `list.remove(Integer.valueOf(1))` removes the value 1. Classic trick question.

## Common interview questions

**When would you choose `LinkedList` over `ArrayList`?** Almost never. Its theoretical O(1) insert at an iterator position is outweighed by per-node allocation, poor cache locality and O(n) positional access. For queue/stack behaviour use `ArrayDeque`; for middle inserts on large lists consider whether you need a different data structure altogether.

**What is the difference between `HashMap` and `Hashtable`?** `Hashtable` is the legacy synchronised map that forbids null keys and values; every method takes the same lock. `HashMap` is unsynchronised, allows one null key, and is the default. For thread safety use `ConcurrentHashMap`, not `Hashtable` or `Collections.synchronizedMap`.

**What does `ConcurrentModificationException` actually tell you?** That a collection was structurally modified while an iterator over it was live, detected via a modification counter. It is usually a single-threaded bug (removing inside a for-each); fix with `Iterator.remove`, `removeIf`, or collecting into a new list.

**Is `List.of(...)` the same as `Collections.unmodifiableList(...)`?** No. `List.of` creates an immutable copy that rejects nulls. `unmodifiableList` is a read-only view over the original list, so mutations of the original are visible through it. Use `List.copyOf` for a defensive copy.

**Why does `Set` not have a `get` method?** Because a set models membership, not lookup. If you want "find the element equal to this one", you want a `Map<K, V>` keyed by the identity, or `TreeSet.floor/ceiling` when the set is sorted.

**How do you sort a `List`?** `list.sort(Comparator.comparing(Person::lastName).thenComparing(Person::age))`, or `Collections.sort`. It is a stable TimSort, O(n log n). Streams' `sorted()` returns a new sorted stream rather than sorting in place.

**What happens if you store a key in a `HashSet` and then mutate it?** Its hash no longer matches the bucket it lives in, so `contains` returns false and `remove` fails while `size()` still counts it. Keys must be effectively immutable in the fields that feed `hashCode`.

**How does `TreeMap` decide two keys are equal?** Solely by `compareTo`/`Comparator` returning 0; it never calls `equals`. A comparator inconsistent with `equals` can silently merge keys.
