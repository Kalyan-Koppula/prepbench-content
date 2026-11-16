---
title: Comparable, Comparator and Ordering
order: 6
summary: Natural order with Comparable, Comparator.comparing chains, nulls, consistency with equals, sort stability, and what TreeMap and TreeSet do with your comparator.
---

Sorting questions in Java interviews are really API questions: can you write a correct multi-key comparator quickly, do you know the overflow trap, and do you understand that `TreeMap` uses `compareTo`, not `equals`, to decide what counts as the same key.

## `Comparable`: natural order

A class implements `Comparable<T>` to define one natural ordering. `String`, the wrappers, `LocalDate`, `Instant`, `BigDecimal` and enums all do.

```java
public record Version(int major, int minor, int patch) implements Comparable<Version> {
    @Override public int compareTo(Version o) {
        int c = Integer.compare(major, o.major);
        if (c != 0) return c;
        c = Integer.compare(minor, o.minor);
        return c != 0 ? c : Integer.compare(patch, o.patch);
    }
}
```

Contract: antisymmetric (`sign(a.compareTo(b)) == -sign(b.compareTo(a))`), transitive, and strongly recommended to be consistent with `equals`. Must throw `NullPointerException` on `null`, which it does naturally.

Never `return this.x - o.x` for `int`s: `Integer.MIN_VALUE - 1` overflows and reverses the sign. Use `Integer.compare`, `Long.compare`, `Double.compare` (which also orders `NaN` and distinguishes `-0.0`), `Boolean.compare`.

## `Comparator`: any order, composed

```java
Comparator<Person> byLast  = Comparator.comparing(Person::lastName);
Comparator<Person> byAge   = Comparator.comparingInt(Person::age);           // no boxing
Comparator<Person> full    = byLast.thenComparing(Person::firstName).thenComparing(byAge.reversed());

people.sort(full);                                           // in place, List.sort
List<Person> sorted = people.stream().sorted(full).toList();  // copy
Collections.sort(people);                                    // natural order; needs Comparable
Arrays.sort(arr, full);
```

Building blocks:

| Method | Effect |
|---|---|
| `Comparator.comparing(keyExtractor)` | Order by a `Comparable` key |
| `comparing(keyExtractor, keyComparator)` | Order by a key with its own comparator, e.g. `String.CASE_INSENSITIVE_ORDER` |
| `comparingInt` / `comparingLong` / `comparingDouble` | Primitive keys, no boxing |
| `thenComparing(...)` | Tie-break; all the same overloads |
| `reversed()` | Flip the whole comparator built so far |
| `Comparator.reverseOrder()` / `naturalOrder()` | For `Comparable` elements |
| `nullsFirst(cmp)` / `nullsLast(cmp)` | Null-tolerant wrapper (see below) |

### The `reversed()` inference trap

```java
Comparator<Person> c = Comparator.comparing(p -> p.lastName()).reversed();    // compile error: p is Object
Comparator<Person> c = Comparator.comparing(Person::lastName).reversed();     // fine: method ref carries the type
Comparator<Person> c = Comparator.comparing((Person p) -> p.lastName()).reversed();  // fine: explicit type
```

The target type `Comparator<Person>` only reaches the start of the chain, so a lambda in `comparing` cannot be inferred once `.reversed()` is appended. Use method references or an explicit parameter type.

### Reverse only one key

`reversed()` flips everything built so far. To reverse one key in a chain, pass a reversed key comparator:

```java
Comparator<Person> c = Comparator.comparing(Person::lastName)
    .thenComparing(Person::age, Comparator.reverseOrder());   // last name asc, age desc
```

## Nulls

`Comparator.comparing(Person::lastName)` throws `NullPointerException` if any `lastName` is null, and `Comparable.compareTo(null)` must throw. Two layers of null handling:

```java
// Null elements in the list
people.sort(Comparator.nullsLast(Comparator.comparing(Person::lastName)));

// Null keys inside non-null elements
people.sort(Comparator.comparing(Person::lastName, Comparator.nullsFirst(Comparator.naturalOrder())));
```

`nullsFirst(cmp)` treats two nulls as equal and a null as less than any non-null; only non-null pairs reach `cmp`. Better than either: do not allow nulls in sorted data.

## Consistency with `equals`

An ordering is consistent with equals when `compareTo(b) == 0` exactly when `equals(b)`. Sorted collections rely on it:

```java
var set = new TreeSet<String>(String.CASE_INSENSITIVE_ORDER);
set.add("Java"); set.add("JAVA");
set.size();                      // 1 — the comparator said they are the same
set.contains("java");            // true
new HashSet<>(set).contains("java");   // false — HashSet uses equals/hashCode
```

`TreeMap`/`TreeSet` use only the comparator for membership, lookup and de-duplication; `equals` and `hashCode` are never called. `BigDecimal` is the JDK's inconsistent example: `new BigDecimal("2.0").equals(new BigDecimal("2.00"))` is `false` but `compareTo` returns `0`, so a `TreeSet<BigDecimal>` and a `HashSet<BigDecimal>` disagree about size. When a comparator deliberately ignores fields (sort by score only), do not use it for a `TreeSet`; sort a list instead.

A `PriorityQueue` also uses only the comparator, and its `iterator()` is not in priority order; only `poll()` is.

## Stability

`List.sort`, `Collections.sort` and `Arrays.sort` on objects use TimSort, which is stable: elements that compare equal keep their original relative order. That is what makes "sort by department, then by name" work as two successive sorts, and why `thenComparing` chains can be shorter when the input already has a useful order. `Arrays.sort` on primitives uses dual-pivot quicksort, which is not stable, but stability is meaningless for primitives anyway. Streams' `sorted()` is stable for ordered streams.

Complexity: O(n log n) comparisons, O(n) extra space for the object sort. For "top k" use a `PriorityQueue` of size k (O(n log k)) rather than sorting everything.

## `TreeMap` and `TreeSet` in practice

- Red-black tree: `put`/`get`/`remove`/`contains` in O(log n), iteration in comparator order.
- Navigation: `firstKey`, `lastKey`, `floorKey(k)` (largest ≤ k), `ceilingKey(k)` (smallest ≥ k), `headMap(k)`, `tailMap(k)`, `subMap(a, b)`, `descendingMap()`. Interviewers like "find the nearest timestamp" and "range query" questions that these answer directly.
- Keys must all be mutually comparable; mixing `Integer` and `String` keys throws `ClassCastException` at insertion. `null` keys throw unless the comparator allows them.
- A comparator that changes behaviour after insertion (because a key field mutated) corrupts the tree the same way a mutated hash key corrupts a `HashMap`.
- `TreeMap` is not thread-safe; `ConcurrentSkipListMap` is the concurrent sorted map.

## Sorting a map by value

```java
Map<String, Integer> scores = Map.of("a", 3, "b", 1, "c", 2);
List<Map.Entry<String, Integer>> byScore = scores.entrySet().stream()
    .sorted(Map.Entry.<String, Integer>comparingByValue().reversed()
            .thenComparing(Map.Entry.comparingByKey()))
    .toList();

LinkedHashMap<String, Integer> ordered = scores.entrySet().stream()
    .sorted(Map.Entry.comparingByValue())
    .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue, (x, y) -> x, LinkedHashMap::new));
```

The explicit type witness `Map.Entry.<String, Integer>comparingByValue()` is the same inference problem as `reversed()`.

## Common interview questions

**`Comparable` versus `Comparator`?**
`Comparable` is implemented by the class and defines its single natural order, used by `Collections.sort` with no arguments and by `TreeMap` by default. `Comparator` is an external object defining any order, so a class can be sorted many ways and classes you do not own can be ordered. Modern code builds comparators with `Comparator.comparing` chains.

**Why not `return a.value - b.value` in a comparator?**
Subtraction overflows when the operands have opposite signs and large magnitude, flipping the result. `Integer.compare(a.value, b.value)` is correct for the full range and is what the JDK uses.

**What does "consistent with equals" mean and why does it matter?**
`compareTo` returns zero exactly when `equals` is true. `TreeSet` and `TreeMap` use the comparator alone to decide duplicates, so an inconsistent comparator means a sorted set and a hash set can disagree on membership, as `BigDecimal` with `2.0` and `2.00` demonstrates.

**Is Java's sort stable?**
For objects, yes: `Arrays.sort`, `List.sort` and `Collections.sort` use TimSort, so equal elements keep their input order. For primitive arrays the dual-pivot quicksort is not stable, which does not matter since equal primitives are indistinguishable.

**How do you sort by one field ascending and another descending?**
`Comparator.comparing(Person::lastName).thenComparing(Person::age, Comparator.reverseOrder())`. Calling `.reversed()` at the end would reverse both keys.

**How do you handle nulls when sorting?**
Wrap with `Comparator.nullsFirst` or `nullsLast` for null elements, and pass a nulls-aware key comparator as the second argument to `comparing` for null keys. Natural ordering never accepts null.

**When would you use a `TreeMap` over a `HashMap`?**
When you need ordered iteration, range queries, or nearest-key lookups (`floorKey`, `ceilingKey`). The cost is O(log n) per operation instead of O(1) and the requirement that keys be comparable.

**Why does `Comparator.comparing(p -> p.name()).reversed()` fail to compile?**
Target typing flows into the first call, but `reversed()` is resolved left to right on the result of `comparing`, so the lambda's parameter has no type information and is inferred as `Object`. A method reference or an explicitly typed lambda parameter fixes it.
