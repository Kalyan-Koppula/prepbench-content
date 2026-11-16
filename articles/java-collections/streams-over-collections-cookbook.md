---
title: Streams Over Collections Cookbook
order: 4
summary: The fifteen stream operations interviewers ask you to type live, each as one snippet with the collector explained, plus the rules of laziness, terminal ops and when not to use a stream.
---

Java streams are the equivalent of chaining `filter`/`map`/`reduce` in JS, with two differences that matter in interviews: they are lazy until a terminal operation runs, and the reduction step is done by *collectors* rather than by hand. Interviewers rarely ask theory; they hand you a `List<Order>` and say "group these by customer and sum the totals". Below are the snippets to have in muscle memory.

## Mental model

```java
list.stream()                 // source: Collection.stream(), Arrays.stream, Stream.of, IntStream.range
    .filter(x -> ...)         // intermediate: lazy, returns a new stream
    .map(x -> ...)
    .sorted()
    .collect(Collectors.toList());   // terminal: runs the pipeline once
```

- Nothing happens until the terminal operation (`collect`, `forEach`, `reduce`, `count`, `findFirst`, `anyMatch`, `toList`). A stream is single-use; reusing it throws `IllegalStateException`.
- `IntStream`/`LongStream`/`DoubleStream` avoid boxing and add `sum`, `average`, `max`, `range`. `mapToInt` gets you there, `boxed()` gets you back.
- `Stream.toList()` (Java 16+) returns an unmodifiable list; `Collectors.toList()` returns a mutable `ArrayList` in practice.
- Streams are not faster than loops for small data; the win is readability. Avoid them in tight hot paths and whenever the lambda needs to mutate outside state.

The sample domain for every snippet:

```java
record Order(String customer, String category, double total, List<String> tags) {}
List<Order> orders = ...;
```

## The fifteen

### 1. Group by a key

```java
Map<String, List<Order>> byCustomer = orders.stream()
    .collect(Collectors.groupingBy(Order::customer));
```

`groupingBy(classifier)` builds a `HashMap<K, List<T>>`. Pass `TreeMap::new` as the second argument for sorted keys, or `LinkedHashMap::new` for first-seen order.

### 2. Group by and aggregate (sum, count, average)

```java
Map<String, Double> revenueByCustomer = orders.stream()
    .collect(Collectors.groupingBy(Order::customer, Collectors.summingDouble(Order::total)));

Map<String, Long> ordersPerCategory = orders.stream()
    .collect(Collectors.groupingBy(Order::category, Collectors.counting()));
```

The second argument is the *downstream collector* applied to each group's elements. `counting`, `summingX`, `averagingX`, `mapping`, `maxBy`, `toSet` all slot in here.

### 3. Group by and pick the best in each group

```java
Map<String, Optional<Order>> biggestPerCustomer = orders.stream()
    .collect(Collectors.groupingBy(Order::customer,
        Collectors.maxBy(Comparator.comparingDouble(Order::total))));

// Without the Optional wrapper:
Map<String, Order> biggest = orders.stream()
    .collect(Collectors.toMap(Order::customer, o -> o,
        BinaryOperator.maxBy(Comparator.comparingDouble(Order::total))));
```

### 4. Frequency map (word count)

```java
Map<String, Long> freq = words.stream()
    .collect(Collectors.groupingBy(w -> w, Collectors.counting()));

// Loop version interviewers also accept:
Map<String, Integer> freq2 = new HashMap<>();
for (String w : words) freq2.merge(w, 1, Integer::sum);
```

### 5. Top-k by a value

```java
List<Order> top3 = orders.stream()
    .sorted(Comparator.comparingDouble(Order::total).reversed())
    .limit(3)
    .toList();
```

O(n log n). Mention that a `PriorityQueue` of size k gives O(n log k) if k is small and n is huge.

### 6. Dedupe preserving first-seen order

```java
List<String> uniqueCustomers = orders.stream()
    .map(Order::customer)
    .distinct()
    .toList();
```

`distinct` uses `equals`/`hashCode` and keeps encounter order on an ordered stream. To dedupe by a *field* while keeping whole objects:

```java
Set<String> seen = ConcurrentHashMap.newKeySet();
List<Order> firstPerCustomer = orders.stream()
    .filter(o -> seen.add(o.customer()))
    .toList();
```

(Stateful lambda; fine sequentially, say so.) The pure alternative is `toMap(Order::customer, o -> o, (a, b) -> a, LinkedHashMap::new)` and `.values()`.

### 7. Flatten nested collections

```java
List<String> allTags = orders.stream()
    .flatMap(o -> o.tags().stream())
    .distinct()
    .toList();
```

`flatMap` is JS `flatMap`: one element in, a stream out, concatenated. Java 16 added `mapMulti` for the push-style variant.

### 8. Partition into two groups

```java
Map<Boolean, List<Order>> bigAndSmall = orders.stream()
    .collect(Collectors.partitioningBy(o -> o.total() > 100));
bigAndSmall.get(true);   // always present, possibly empty
```

`partitioningBy` is `groupingBy` on a boolean predicate; both keys always exist. It takes a downstream collector too.

### 9. Join strings

```java
String csv = orders.stream()
    .map(Order::customer)
    .distinct()
    .sorted()
    .collect(Collectors.joining(", ", "[", "]"));   // "[alice, bob]"
```

`joining` works only on `Stream<CharSequence>`, so `map` to string first.

### 10. List to map, and what to do about duplicate keys

```java
Map<String, Double> totalByCustomer = orders.stream()
    .collect(Collectors.toMap(Order::customer, Order::total, Double::sum));
```

`toMap` throws `IllegalStateException` on a duplicate key unless you pass a merge function. It also throws `NullPointerException` on a null value. Fourth argument chooses the map type (`TreeMap::new`).

### 11. Sum, max, average over a field

```java
double revenue = orders.stream().mapToDouble(Order::total).sum();
OptionalDouble avg = orders.stream().mapToDouble(Order::total).average();
Optional<Order> max = orders.stream().max(Comparator.comparingDouble(Order::total));
DoubleSummaryStatistics stats = orders.stream()
    .collect(Collectors.summarizingDouble(Order::total));   // count, sum, min, max, average
```

Use primitive streams for arithmetic; `reduce(0.0, Double::sum)` works but boxes every element.

### 12. Sort by several keys, nulls last

```java
List<Order> sorted = orders.stream()
    .sorted(Comparator.comparing(Order::category)
        .thenComparing(Order::total, Comparator.reverseOrder())
        .thenComparing(Order::customer, Comparator.nullsLast(Comparator.naturalOrder())))
    .toList();
```

`Comparator.comparing(keyExtractor)` plus `thenComparing`, `reversed`, `nullsFirst/Last`. `reversed()` applies to the whole comparator built so far, so place it carefully.

### 13. Find first match, any match, none match

```java
Optional<Order> firstBig = orders.stream().filter(o -> o.total() > 1000).findFirst();
boolean anyRefund = orders.stream().anyMatch(o -> o.total() < 0);
boolean allTagged = orders.stream().allMatch(o -> !o.tags().isEmpty());
```

These short-circuit: `findFirst` stops at the first hit, so `filter` runs only as far as needed.

### 14. Index-based and range operations

```java
List<String> labelled = IntStream.range(0, items.size())
    .mapToObj(i -> i + ": " + items.get(i))
    .toList();

int[] squares = IntStream.rangeClosed(1, 5).map(i -> i * i).toArray();
List<List<Integer>> chunks = IntStream.range(0, (xs.size() + 2) / 3)
    .mapToObj(i -> xs.subList(i * 3, Math.min(xs.size(), (i + 1) * 3)))
    .toList();
```

There is no `map((x, i) => ...)` as in JS; iterate indices with `IntStream.range`.

### 15. Nested grouping and multi-level maps

```java
Map<String, Map<String, Double>> revenueByCustomerAndCategory = orders.stream()
    .collect(Collectors.groupingBy(Order::customer,
        Collectors.groupingBy(Order::category, Collectors.summingDouble(Order::total))));

Map<String, Set<String>> categoriesPerCustomer = orders.stream()
    .collect(Collectors.groupingBy(Order::customer,
        Collectors.mapping(Order::category, Collectors.toSet())));
```

`mapping(fn, downstream)` transforms elements before the downstream collector; `filtering(pred, downstream)` and `flatMapping` exist too. `collectingAndThen(downstream, finisher)` post-processes, e.g. `collectingAndThen(toList(), List::copyOf)`.

## Collector cheat table

| Collector | Produces |
|---|---|
| `toList()`, `toSet()`, `toUnmodifiableList()` | Collections |
| `toMap(k, v)`, `toMap(k, v, merge)`, `toMap(k, v, merge, mapFactory)` | Map; throws on duplicate keys without `merge` |
| `groupingBy(k)`, `groupingBy(k, downstream)`, `groupingBy(k, mapFactory, downstream)` | `Map<K, List<T>>` or `Map<K, D>` |
| `partitioningBy(pred[, downstream])` | `Map<Boolean, ...>`, both keys always present |
| `counting()`, `summingInt/Long/Double`, `averagingX`, `summarizingX` | Scalars or stats objects |
| `minBy(cmp)`, `maxBy(cmp)` | `Optional<T>` |
| `mapping(fn, d)`, `filtering(pred, d)`, `flatMapping(fn, d)` | Adapts elements before `d` |
| `joining(sep, prefix, suffix)` | String |
| `reducing(identity, op)` | Arbitrary fold |
| `teeing(c1, c2, merge)` | Two collectors in one pass (Java 12+) |
| `collectingAndThen(d, finisher)` | Post-processed result |

## Parallel streams in one paragraph

`parallelStream()` splits the source with a `Spliterator` and runs stages on the common `ForkJoinPool`. It helps for CPU-heavy, side-effect-free work over large `ArrayList`s or arrays and hurts for small data, I/O, `LinkedList`, or anything that touches shared mutable state. `forEach` on a parallel stream loses order; `forEachOrdered` keeps it at a cost. The interview answer: "I'd measure, and I'd rather hand I/O-bound work to an executor or virtual threads."

## Common interview questions

**What is the difference between intermediate and terminal operations?** Intermediate operations (`filter`, `map`, `sorted`, `distinct`, `limit`) are lazy and return a new stream; nothing runs until a terminal operation (`collect`, `reduce`, `forEach`, `count`, `findFirst`) pulls elements through. Short-circuiting terminals like `findFirst` or `anyMatch` stop early.

**`map` vs `flatMap`?** `map` transforms each element one-to-one. `flatMap` maps each element to a stream and concatenates them, turning `Stream<List<T>>` into `Stream<T>`. Same as JS `flatMap`.

**How do you group a list of objects by a field and count each group?** `Collectors.groupingBy(T::field, Collectors.counting())`, which yields `Map<Field, Long>`. Replace `counting()` with `summingDouble`, `mapping` or `maxBy` for other aggregates.

**Why did `Collectors.toMap` throw `IllegalStateException`?** Two elements produced the same key and no merge function was supplied. Pass a third argument such as `(a, b) -> a` to keep the first, or `Double::sum` to combine.

**When would you not use a stream?** When the loop body needs to mutate local variables or break early with complex conditions, when throwing checked exceptions from lambdas, in hot paths where a loop is measurably faster, or when the stream would be reused or needs an index.

**What does `Stream.toList()` return?** An unmodifiable list containing the elements in encounter order (nulls allowed). `Collectors.toList()` makes no guarantee about mutability or type, though it currently returns an `ArrayList`.

**How do you dedupe by a field while keeping the whole object?** `toMap(T::field, o -> o, (a, b) -> a, LinkedHashMap::new)` then `.values()`, or `filter` with a `Set.add` side effect in a sequential stream. `distinct()` alone would compare whole objects.

**Is `sorted()` on a stream stable?** Yes for ordered streams; it uses the same stable sort as `List.sort`. It buffers the entire stream, so it is a full barrier and O(n log n); prefer `min`/`max` or a heap when you only need a few elements.
