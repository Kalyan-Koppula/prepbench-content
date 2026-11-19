---
title: Immutability and Value Objects
order: 3
summary: Making a class immutable properly — final, no setters, defensive copies, records — why it matters for map keys and threads, and Collections.unmodifiable* versus List.copyOf.
---

"How do you make a class immutable?" is a checklist question, and the follow-ups ("what if it holds a `List`?", "what about `Date`?", "is `unmodifiableList` immutable?") are where candidates fall over. Immutability is also the simplest correct answer to half the concurrency questions, so it is worth being exact.

## The checklist

1. Declare the class `final` (or make every constructor private and use factories) so no subclass can add mutable state.
2. Make every field `private final`.
3. No setters, no methods that mutate state; "modifiers" return a new instance.
4. Defensive-copy mutable arguments in the constructor.
5. Defensive-copy or wrap mutable fields in accessors; never return the internal array or collection.
6. Do not let `this` escape during construction (no registering listeners in the constructor).

```java
public final class Order {
    private final String id;
    private final List<Line> lines;
    private final Instant placedAt;

    public Order(String id, List<Line> lines, Instant placedAt) {
        this.id = Objects.requireNonNull(id);
        this.lines = List.copyOf(lines);                 // copies, rejects nulls, result is unmodifiable
        this.placedAt = Objects.requireNonNull(placedAt); // Instant is itself immutable, no copy needed
    }

    public String id() { return id; }
    public List<Line> lines() { return lines; }          // safe: already unmodifiable
    public Instant placedAt() { return placedAt; }

    public Order withLine(Line extra) {                   // "mutation" yields a new object
        var next = new ArrayList<>(lines);
        next.add(extra);
        return new Order(id, next, placedAt);
    }
}
```

`Line` must be immutable too, or `lines` is only shallowly immutable. Immutability is transitive or it is not immutability.

### Arrays

Arrays are always mutable. Copy in (`this.data = data.clone()`) and copy out (`return data.clone()`), or expose a read-only view such as a `List` via `List.of(data)` for object arrays or an `IntStream` for primitives.

### Legacy mutable types

`java.util.Date`, `Calendar`, `StringBuilder`, `AtomicInteger`: copy them or, better, replace with `Instant`, `String`, `int`. Modern code rarely needs to defensively copy anything but collections and arrays.

## Records

A record satisfies steps 1–3 automatically: final class, private final fields, no setters. Steps 4 and 5 are still on you:

```java
public record Order(String id, List<Line> lines, Instant placedAt) {
    public Order {
        Objects.requireNonNull(id);
        lines = List.copyOf(lines);        // compact constructor normalises the component
    }
    public Order withLine(Line extra) {
        var next = new ArrayList<>(lines);
        next.add(extra);
        return new Order(id, next, placedAt);
    }
}
```

Forgetting `List.copyOf` in the compact constructor is the most common record bug: the caller keeps a reference to the list and mutates it later, and the record's `equals`/`hashCode` change under it.

## Why it matters

### Map keys and set elements

`HashMap` computes the bucket from `hashCode()` on insertion. If the key's state changes afterwards, its hash no longer matches the bucket, `get` looks in the wrong place, and the entry is unreachable while still occupying memory. `TreeMap` has the same failure through `compareTo`. Keys must be immutable, or at least their `equals`/`hashCode` fields must be.

### Threads

An immutable object can be shared between threads without synchronisation. The Java Memory Model guarantees that `final` fields are visible to every thread that obtains a reference after the constructor completes (safe publication of final fields), which is a guarantee ordinary fields do not have. Immutable messages are why `record` DTOs, `Instant` and `String` need no locks, and why replacing a shared `volatile` reference to an immutable snapshot (copy-on-write) is a complete concurrency strategy for read-mostly data.

### Everything else

Easier reasoning (no action-at-a-distance), safe caching and memoisation, free `equals`/`hashCode` stability, no defensive copying at every boundary, and no "who changed this list" debugging sessions. The cost is allocation on every change, which the JVM's allocator and generational GC are designed for; it is rarely the bottleneck people fear.

## Value objects versus entities

| | Value object | Entity |
|---|---|---|
| Identity | By value: two with equal fields are the same thing | By id: fields may change, identity does not |
| Mutability | Immutable | Usually mutable over its lifecycle |
| Java form | `record`, `final` class | Class with an id, often a JPA `@Entity` |
| Examples | `Money`, `Email`, `Coordinates`, `DateRange` | `Order`, `User`, `Account` |

Wrapping primitives in small value types (`record Email(String value)` with validation in the compact constructor) prevents argument-order bugs and centralises validation. Interviewers call this "avoiding primitive obsession".

## Unmodifiable versus immutable collections

| | `Collections.unmodifiableList(list)` | `List.copyOf(list)` / `List.of(...)` / `Stream.toList()` |
|---|---|---|
| What it is | A read-only view over the original list | A new, independent, unmodifiable list |
| Changes to the original visible? | Yes | No |
| Nulls | Allowed if the source allows | Rejected (`NullPointerException`) |
| `add`/`set`/`remove` | `UnsupportedOperationException` | `UnsupportedOperationException` |
| Use when | You want to expose a live view without copying | You want a snapshot nobody can change |

```java
var source = new ArrayList<>(List.of("a"));
var view = Collections.unmodifiableList(source);
var copy = List.copyOf(source);
source.add("b");
view.size();   // 2 — the view reflects the mutation
copy.size();   // 1
```

`List.copyOf` is cheap when the argument is already an immutable `List.of` list: it returns it as is. The JDK's `ImmutableCollections` also randomise `Set.of`/`Map.of` iteration order per JVM run so nobody relies on it.

Java 21 adds `Collections.unmodifiableSequencedCollection` and friends; the same view semantics apply.

## Builders for many fields

When a value type has many optional fields, a constructor with twelve parameters is not usable. The builder pattern collects fields mutably and produces an immutable result; `Lombok @Builder` or a hand-written static nested `Builder` class. Covered in the design patterns article. The invariant is that the built object is still immutable; only the builder mutates.

## Mutable where it belongs

Immutability is the default, not a religion. Keep mutability for accumulators inside a method, builders, caches with explicit synchronisation, and entities with a lifecycle. The rule is that mutable state should be local or guarded, never shared and unguarded.

## Worked example: making a mutable class immutable

Start with a typical mutable class:

```java
public class Order {
    private String id;
    private List<String> items;
    private Date createdAt;

    public Order(String id, List<String> items, Date createdAt) {
        this.id = id;
        this.items = items;           // shares the caller's list
        this.createdAt = createdAt;   // shares a mutable Date
    }

    public List<String> getItems() { return items; } // callers can modify our list
    public void setId(String id) { this.id = id; }
}
```

Three ways callers can change an "immutable" object after the fact: through the setter, by modifying the list they passed in, and by modifying the list returned by the getter. The immutable version:

```java
public final class Order {                             // 1. can't be subclassed to add mutability
    private final String id;                           // 2. final fields
    private final List<String> items;
    private final Instant createdAt;                   // 3. immutable type instead of Date

    public Order(String id, List<String> items, Instant createdAt) {
        this.id = Objects.requireNonNull(id);
        this.items = List.copyOf(items);              // 4. defensive copy in (also rejects nulls)
        this.createdAt = Objects.requireNonNull(createdAt);
    }

    public String id() { return id; }
    public List<String> items() { return items; }     // 5. already unmodifiable, safe to return
    public Instant createdAt() { return createdAt; }

    public Order withItem(String item) {               // 6. "modification" returns a new object
        List<String> next = new ArrayList<>(items);
        next.add(item);
        return new Order(id, next, createdAt);
    }
}
```

As a record, the same thing is shorter: `record Order(String id, List<String> items, Instant createdAt)` with a compact constructor that does `items = List.copyOf(items);`.

## The cost, and how to keep it low

Creating a new object for every change sounds expensive, but:

- Short-lived objects are cheap to allocate and collect in modern JVMs (see [JVM Memory and Garbage Collection](/read/jvm-memory-and-garbage-collection)).
- Immutable objects can be **shared** freely: no defensive copies when passing them around, no locks between threads.
- For large structures that change often, use a builder to accumulate changes and produce one immutable result, or persistent data structures that share most of their internals between versions.

Where mutability belongs: performance-critical inner loops, builders, JPA entities, and objects whose identity persists while their state changes (a shopping cart in memory). Keep that mutability contained and don't leak it.

## Common interview questions

**How do you make a class immutable?**
Final class, private final fields, no setters, every mutable argument defensively copied in the constructor and never exposed from accessors, and `this` not leaking during construction. Or use a record and remember to `List.copyOf` any collection components in the compact constructor.

**Is a record automatically immutable?**
Shallowly. The fields are final, but a component that is a `List`, array or other mutable type can still be mutated by whoever holds a reference. Normalise with `List.copyOf` in the compact constructor and keep component types immutable.

**Why must `HashMap` keys be immutable?**
The bucket is chosen from the key's hash at insertion. If the key changes so that its hash changes, lookups go to the wrong bucket and the entry becomes unreachable, though it still counts toward `size()` and memory.

**What is the difference between `Collections.unmodifiableList` and `List.copyOf`?**
`unmodifiableList` is a view: the receiver cannot modify it, but changes to the underlying list show through. `List.copyOf` is an independent snapshot. Both throw on mutation; only the copy is truly immutable.

**Why is immutability good for concurrency?**
There is no state to race on, and the memory model guarantees final fields are visible to any thread that sees the object after construction. Immutable values can be shared freely, and swapping a reference to a new immutable snapshot is a lock-free way to update shared state.

**What is a defensive copy and when do you need one?**
Copying a mutable argument on the way in and a mutable field on the way out so that no outside code shares your internal state. Needed for arrays, mutable collections and legacy types like `Date`; unnecessary for `String`, `Instant`, records and other immutables.

**Isn't creating a new object on every change slow?**
Allocation in the JVM is a pointer bump and short-lived objects die cheaply in the young generation. For the sizes typical of value objects it is not measurable; for large structures use persistent collections or a builder for batch changes.

**What is a value object?**
An object whose identity is its value: two instances with equal fields are interchangeable, so it is immutable and defines `equals`/`hashCode` on all fields. `Money`, `Email` and `DateRange` are value objects; an `Order` with an id is an entity.

## Pitfalls

- Declaring fields `final` but exposing mutable collections or dates through getters.
- Forgetting the defensive copy in constructors.
- Using `Collections.unmodifiableList(list)` and assuming the result can't change; it's a view, and the original list can still change underneath it.
- Making JPA entities immutable (frameworks need to mutate them).
- Deep object graphs where one mutable leaf undermines the whole value.

## Key takeaways

- Immutable means: `final` class, `private final` fields, no setters, defensive copies in and out.
- `List.copyOf` and `Map.copyOf` produce truly unmodifiable copies; `unmodifiable…` views don't.
- Records are the easiest route to immutable value objects; still copy mutable components.
- Immutable objects are thread-safe, safe as map keys and easy to reason about.
- Value objects compare by value; entities compare by identity.
