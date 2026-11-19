---
title: Streams and Optional
order: 7
summary: Pipeline anatomy and laziness, the Collectors you need (and the toMap trap), flatMap, boxing and primitive streams, when parallel streams hurt, and the rules for Optional.
---

Streams are Java's `map`/`filter`/`reduce`, with two differences that generate interview questions: they are lazy single-use pipelines, and the terminal step is where all the interesting collectors live. `Optional` is the companion that interviewers check you are not abusing.

## Pipeline anatomy

```java
List<String> names = people.stream()               // source
    .filter(p -> p.age() >= 18)                    // intermediate, lazy
    .map(Person::name)                             // intermediate, lazy
    .sorted()                                      // intermediate, stateful
    .toList();                                     // terminal: runs the pipeline
```

- Nothing happens until the terminal operation. Intermediate ops build a chain; the terminal pulls elements through it one at a time.
- Elements flow vertically: `filter` then `map` for element 1, then for element 2. Not "filter everything, then map everything". This is why `findFirst` after `filter` stops early.
- A stream can be consumed once. A second terminal call throws `IllegalStateException`.
- `peek` is for debugging; relying on it for side effects is wrong because elided ops (e.g. `count()` on a sized source) may skip it.

### Intermediate ops

| Stateless | Stateful (need to see more elements) |
|---|---|
| `filter`, `map`, `mapToInt`, `flatMap`, `mapMulti`, `peek`, `takeWhile`, `dropWhile` | `sorted`, `distinct`, `limit`, `skip` |

Stateful ops are barriers in parallel streams and cost memory (`sorted` buffers everything).

### Terminal ops

`toList()` (unmodifiable, Java 16), `collect(...)`, `forEach`, `reduce`, `count`, `sum` (primitive streams), `min`/`max`, `anyMatch`/`allMatch`/`noneMatch` (short-circuit), `findFirst`/`findAny`, `toArray`, `iterator`.

Sources: `collection.stream()`, `Arrays.stream(arr)`, `Stream.of(...)`, `IntStream.range(0, n)`, `Stream.iterate(seed, hasNext, next)`, `Stream.generate(supplier)`, `Files.lines(path)`, `string.chars()`, `map.entrySet().stream()`.

## Collectors

```java
import static java.util.stream.Collectors.*;

Map<String, List<Person>> byCity = people.stream().collect(groupingBy(Person::city));
Map<String, Long> countByCity    = people.stream().collect(groupingBy(Person::city, counting()));
Map<String, Double> avgAge       = people.stream().collect(groupingBy(Person::city, averagingInt(Person::age)));
Map<String, Set<String>> names   = people.stream().collect(groupingBy(Person::city, mapping(Person::name, toSet())));
Map<Boolean, List<Person>> adult = people.stream().collect(partitioningBy(p -> p.age() >= 18));
String csv                       = names.keySet().stream().sorted().collect(joining(", ", "[", "]"));
TreeMap<String, Long> sortedKeys = people.stream().collect(groupingBy(Person::city, TreeMap::new, counting()));
```

- `partitioningBy` always has both `true` and `false` keys, even if one list is empty; `groupingBy` only has keys that occurred.
- `groupingBy` returns a `HashMap` by default; pass a map factory for `TreeMap` or `LinkedHashMap`.
- Downstream collectors nest: `groupingBy(city, groupingBy(ageBand, counting()))`.
- `teeing(c1, c2, merger)` runs two collectors over one pass.
- `summarizingInt` gives count/sum/min/max/average in one object.

### The `toMap` traps

```java
Map<String, Person> byEmail = people.stream()
    .collect(toMap(Person::email, Function.identity()));
```

1. Duplicate keys throw `IllegalStateException: Duplicate key`. Pass a merge function: `toMap(Person::email, p -> p, (a, b) -> a)`.
2. A `null` value throws `NullPointerException` (the implementation uses `Map.merge`). Filter nulls first or collect differently.
3. Default map is `HashMap`; for insertion order use the four-argument form with `LinkedHashMap::new`.

```java
Map<String, Person> latest = people.stream().collect(toMap(
    Person::email,
    p -> p,
    BinaryOperator.maxBy(Comparator.comparing(Person::updatedAt)),
    LinkedHashMap::new));
```

## `flatMap` and `mapMulti`

```java
List<String> allTags = posts.stream()
    .flatMap(post -> post.tags().stream())
    .distinct()
    .toList();

Optional<Config> cfg = Optional.ofNullable(user)
    .flatMap(User::settings)          // settings() returns Optional<Settings>; map would give Optional<Optional<Settings>>
    .map(Settings::config);
```

`mapMulti` (Java 16) is an imperative `flatMap` that avoids creating a stream per element: `(post, sink) -> post.tags().forEach(sink)`. Mention it when asked about `flatMap` performance.

## Boxing and primitive streams

`Stream<Integer>` boxes every element. `IntStream`, `LongStream` and `DoubleStream` do not, and add `sum`, `average`, `max` returning `OptionalInt`/`OptionalDouble`, `summaryStatistics`, and `range`/`rangeClosed`.

```java
int total = orders.stream().mapToInt(Order::amount).sum();     // no boxing
double avg = IntStream.of(3, 5, 8).average().orElse(0);
List<Integer> boxed = IntStream.range(0, 5).boxed().toList();  // back to objects when a collection is needed
```

`Stream<Integer>.reduce(0, Integer::sum)` works but boxes on every step; `mapToInt(..).sum()` is what a reviewer expects.

## `reduce` versus `collect`

`reduce` combines immutable values: `reduce(0, Integer::sum)`, `reduce(BigDecimal.ZERO, BigDecimal::add)`. `collect` mutates a container: `collect(ArrayList::new, List::add, List::addAll)`. Reducing into a mutable accumulator (`reduce(new ArrayList<>(), (l, x) -> { l.add(x); return l; }, ...)`) is wrong under parallelism and is what `collect` exists for.

The three-argument `reduce(identity, accumulator, combiner)` is for changing type in parallel; the combiner must be associative and the identity must truly be an identity, or parallel results differ.

## Parallel streams

`stream().parallel()` splits the source across the common `ForkJoinPool` (CPU count − 1 threads plus the caller). Use it only when all of these hold:

- The work per element is CPU-bound and substantial (not a hash lookup).
- The source splits well: `ArrayList`, arrays, `IntStream.range`. `LinkedList`, `Stream.iterate`, I/O sources split badly.
- No stateful ops like `sorted`/`limit` with ordering demands, and no side effects on shared state.
- You are not in a web request. Parallel streams share one JVM-wide pool; blocking I/O in them starves every other parallel stream and `CompletableFuture.supplyAsync` default in the process.

`forEach` on a parallel stream has no order; `forEachOrdered` does. `findAny` is cheaper than `findFirst` in parallel. If you need parallelism for I/O, use an executor or virtual threads, not a parallel stream.

## Optional rules

`Optional<T>` is a return-type signal that a value may be absent. Rules that interviewers and reviewers hold you to:

| Do | Don't |
|---|---|
| Return it from finder methods: `Optional<User> findById(id)` | Use it as a field, parameter or collection element |
| `map`, `flatMap`, `filter`, `orElse`, `orElseGet`, `orElseThrow`, `ifPresentOrElse` | `isPresent()` followed by `get()` — that is a null check with extra steps |
| `orElseThrow(() -> new NotFound(id))` | `get()` with no check (throws `NoSuchElementException`) |
| Return an empty collection for "none" | Return `Optional<List<T>>` |
| `Optional.ofNullable(maybeNull)` | `Optional.of(maybeNull)` — throws on null |
| Treat it as a one-element stream: `.stream()` to flatten | Serialise it in DTOs (it is not `Serializable`, and Jackson needs a module) |

```java
String city = findUser(id)
    .map(User::address)
    .filter(a -> a.country().equals("IN"))
    .map(Address::city)
    .orElse("unknown");
```

`orElse(x)` always evaluates `x`; `orElseGet(supplier)` evaluates lazily. The primitive variants `OptionalInt`/`OptionalLong`/`OptionalDouble` avoid boxing but lack `map`.

## Stream versus loop

Streams win for declarative transformations, grouping and collecting; loops win for early exit with complex conditions, mutation of several accumulators, checked exceptions, and index access. Interviewers accept either; they reject a stream with side effects (`forEach(x -> map.put(...))`) when a collector exists.

## Worked example: a sales report with streams

```java
record Sale(String region, String product, int quantity, BigDecimal unitPrice, LocalDate date) {
    BigDecimal total() { return unitPrice.multiply(BigDecimal.valueOf(quantity)); }
}

// Revenue per region for 2025, highest first
Map<String, BigDecimal> revenueByRegion = sales.stream()
    .filter(s -> s.date().getYear() == 2025)
    .collect(Collectors.groupingBy(
        Sale::region,
        Collectors.reducing(BigDecimal.ZERO, Sale::total, BigDecimal::add)));

List<Map.Entry<String, BigDecimal>> ranked = revenueByRegion.entrySet().stream()
    .sorted(Map.Entry.<String, BigDecimal>comparingByValue().reversed())
    .toList();

// Top three products by units sold
List<String> topProducts = sales.stream()
    .collect(Collectors.groupingBy(Sale::product, Collectors.summingInt(Sale::quantity)))
    .entrySet().stream()
    .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
    .limit(3)
    .map(Map.Entry::getKey)
    .toList();

// Several statistics in one pass
IntSummaryStatistics stats = sales.stream().mapToInt(Sale::quantity).summaryStatistics();
// stats.getMin(), getMax(), getAverage(), getSum(), getCount()
```

How the first pipeline executes: streams are **lazy** and process one element at a time through the whole chain. Nothing happens until `collect` (the terminal operation) pulls elements; each sale is tested by `filter` and, if it passes, immediately added to its region's running total. There is no intermediate list of filtered sales.

The same report with a loop:

```java
Map<String, BigDecimal> revenue = new HashMap<>();
for (Sale s : sales) {
    if (s.date().getYear() != 2025) continue;
    revenue.merge(s.region(), s.total(), BigDecimal::add);
}
```

Both are fine. The stream version names each step; the loop is easier to debug with a breakpoint and to extend with early exits. Teams usually prefer streams for transformations and loops for complex control flow.

## Laziness, short-circuiting and order

```java
Stream.of("a", "bb", "ccc", "dddd")
    .peek(s -> System.out.println("saw " + s))
    .filter(s -> s.length() > 1)
    .findFirst();
// saw a
// saw bb   ← stops here: findFirst short-circuits
```

- Intermediate operations (`filter`, `map`, `sorted`) build the pipeline; terminal operations (`collect`, `forEach`, `findFirst`, `count`) run it.
- Short-circuiting operations (`findFirst`, `anyMatch`, `limit`) stop pulling elements early, which also makes infinite streams usable: `Stream.iterate(1, n -> n * 2).limit(10)`.
- `sorted` is a **stateful barrier**: it must see every element before passing any on.
- A stream can be consumed only once; a second terminal operation throws `IllegalStateException`.

## Common interview questions

**What is the difference between intermediate and terminal operations?**
Intermediate operations return a new stream and are lazy; they record a step. A terminal operation triggers the traversal, produces a result or side effect, and closes the stream. Without a terminal op nothing runs, and the stream cannot be reused afterwards.

**Why does `Collectors.toMap` throw `IllegalStateException`?**
It has no merge policy by default, so a duplicate key is an error. Supply a merge function as the third argument, and remember it also rejects `null` values. Use `groupingBy` when multiple values per key are expected.

**`map` versus `flatMap`?**
`map` transforms each element one-to-one. `flatMap` maps each element to a stream and concatenates them, so one-to-many relationships flatten into a single stream. The same distinction applies to `Optional.flatMap` when the mapper itself returns an `Optional`.

**When should you not use a parallel stream?**
When the work is I/O-bound, the per-element cost is tiny, the source splits poorly, ordering matters, or you are inside a server handling concurrent requests, because every parallel stream shares the common fork-join pool. Measure before parallelising; most pipelines get slower.

**What is wrong with `Optional` as a field or parameter?**
It adds a wrapper that callers must unwrap, is not `Serializable`, and still allows the `Optional` reference itself to be null. Use overloads or nullable parameters with `@Nullable`, and nullable fields with proper accessors. `Optional` is a return type.

**Why is a stream single-use?**
It is an iterator-like pipeline over a source, not a collection. Once a terminal op has consumed the elements, there is nothing to re-traverse. Create a new stream from the source, or collect to a list and stream that.

**How does `groupingBy` differ from `partitioningBy`?**
`groupingBy` keys by an arbitrary classifier and only contains keys that appeared. `partitioningBy` keys by a predicate and always contains both `true` and `false` entries, which matters when you then call `get(true)` on an empty input.

**What does `Stream.toList()` return and how does it differ from `collect(toList())`?**
`toList()` returns an unmodifiable list that permits nulls. `collect(Collectors.toList())` returns an `ArrayList` in practice but the spec does not promise mutability; use `collect(toCollection(ArrayList::new))` when you need to mutate.

## Pitfalls

- Calling `.get()` on an `Optional` without checking; use `orElse`, `orElseThrow` or `map`.
- Using `Optional` for fields or parameters; it is designed for return values.
- Side effects inside `map` or `filter`, which make laziness and parallelism unpredictable.
- `Collectors.toMap` without a merge function on keys that may repeat (`IllegalStateException`).
- `parallel()` on small inputs or with shared mutable state.
- Reusing a stream after a terminal operation.

## Key takeaways

- A stream is a lazy, single-use pipeline: a source, intermediate operations, one terminal operation.
- `collect` with `groupingBy`, `toMap`, `partitioningBy` and downstream collectors covers most reporting.
- Use primitive streams (`mapToInt`) to avoid boxing and to get `sum`, `average` and statistics.
- `Optional` is for return values that may be absent; never call `get` blindly.
- Prefer loops when control flow (early exits, checked exceptions, complex state) dominates.
