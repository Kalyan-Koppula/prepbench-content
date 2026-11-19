---
title: Records, Enums, Sealed Types and Pattern Matching
order: 3
summary: Records and their constructors, enums with state and behaviour, EnumMap/EnumSet, sealed hierarchies, and the switch/instanceof pattern matching that makes them a closed algebraic type.
---

These four features are where modern Java looks least like the Java interviewers learned, so they ask about them to check whether you write 2024 Java or 2008 Java. Together they give you what TypeScript gives with discriminated unions: data with a closed set of shapes, destructured in a `switch` the compiler checks for completeness.

## Records

A record is a transparent, immutable carrier of data. You declare the components; the compiler writes the private final fields, a canonical constructor, accessors (`name()`, not `getName()`), `equals`, `hashCode` and `toString`.

```java
public record Point(int x, int y) {}

var p = new Point(1, 2);
p.x();                       // 1
p.equals(new Point(1, 2));   // true
p.toString();                // Point[x=1, y=2]
```

Rules that matter:

- Implicitly `final`; cannot extend a class (it already extends `java.lang.Record`); can implement interfaces.
- No instance fields beyond the components. Static fields and static methods are fine.
- Components are `final`. "Modifying" means building a new record.
- Can be nested, local (declared inside a method) and generic: `record Pair<A, B>(A first, B second) {}`.

### Compact constructor

Validation or normalisation without re-typing the assignments:

```java
public record Range(int lo, int hi) {
    public Range {                               // no parameter list
        if (lo > hi) throw new IllegalArgumentException("lo > hi");
    }
}

public record Name(String value) {
    public Name {
        value = value.strip();                   // reassigning the parameter is allowed; fields are assigned after
    }
}
```

Defensive copies belong here too: `items = List.copyOf(items);` so a caller's mutable list cannot leak in.

### Extra constructors and methods

```java
public record Money(String currency, long cents) {
    public Money(String currency) { this(currency, 0); }     // must delegate to the canonical one
    public Money plus(Money o) { return new Money(currency, cents + o.cents); }
    public static Money zero(String ccy) { return new Money(ccy, 0); }
}
```

### When not to use a record

- The type needs mutable state (an entity with a lifecycle, a builder, a counter).
- You need to hide the representation. Record components are the public API; accessors cannot be removed.
- JPA entities: Hibernate needs a no-arg constructor and setters or field access on a non-final class. Records are for DTOs and projections.
- The class has many optional fields; a record constructor with eight parameters is worse than a builder.

## Enums

An enum is a class with a fixed set of instances created at class-load time. Each constant is a singleton, so `==` is correct and null-safe.

```java
public enum Status {
    ACTIVE("A"), SUSPENDED("S"), CLOSED("C");

    private final String code;
    Status(String code) { this.code = code; }          // constructors are implicitly private
    public String code() { return code; }

    public boolean canTransact() { return this == ACTIVE; }

    public static Status fromCode(String c) {
        for (var s : values()) if (s.code.equals(c)) return s;
        throw new IllegalArgumentException("unknown status " + c);
    }
}
```

Built in: `values()`, `valueOf("ACTIVE")` (throws on unknown), `name()`, `ordinal()`, `compareTo` by ordinal, `Comparable`, `Serializable`, a `toString` you may override.

- Never persist `ordinal()`. Reordering constants silently corrupts stored data; store `name()` or an explicit code.
- Enums can implement interfaces and have abstract methods with a body per constant:

```java
enum Op {
    ADD { int apply(int a, int b) { return a + b; } },
    MUL { int apply(int a, int b) { return a * b; } };
    abstract int apply(int a, int b);
}
```

- An enum is the simplest correct singleton: serialisation-safe, reflection-proof, thread-safe by class loading.

### `EnumMap` and `EnumSet`

Both are backed by the ordinal: `EnumMap` is an array indexed by ordinal, `EnumSet` is a bit vector. Faster and smaller than `HashMap`/`HashSet`, iteration in declaration order, nulls rejected as keys.

```java
Map<Status, Integer> counts = new EnumMap<>(Status.class);
Set<Status> open = EnumSet.of(Status.ACTIVE, Status.SUSPENDED);
Set<Status> all = EnumSet.allOf(Status.class);
Set<Status> rest = EnumSet.complementOf(open);
```

Use them whenever the key type is an enum; interviewers like hearing why.

## Sealed interfaces and classes

`sealed` restricts which types may extend or implement a type. Every permitted subtype must be `final`, `sealed` or `non-sealed`.

```java
public sealed interface Shape permits Circle, Rect, Triangle {}
public record Circle(double r) implements Shape {}
public record Rect(double w, double h) implements Shape {}
public record Triangle(double b, double h) implements Shape {}
```

The `permits` clause can be omitted when all subtypes are in the same file. The payoff is exhaustiveness: a `switch` over a sealed type with no `default` is a compile error when a case is missing, and adding a fourth shape breaks every incomplete switch in the codebase instead of silently falling through.

Why `non-sealed` exists: it lets one branch of the hierarchy reopen for extension (plug-in subtypes) while the rest stays closed.

## Pattern matching

### `instanceof` patterns (Java 16)

```java
if (o instanceof String s && !s.isBlank()) {
    use(s);                        // s is in scope and typed
}
if (!(o instanceof Integer i)) return;
System.out.println(i + 1);         // flow scoping: i is in scope after the early return
```

### Switch patterns (Java 21)

```java
static double area(Shape s) {
    return switch (s) {
        case Circle c   -> Math.PI * c.r() * c.r();
        case Rect r     -> r.w() * r.h();
        case Triangle t -> 0.5 * t.b() * t.h();
    };                               // exhaustive: no default needed, compiler-checked
}
```

Features to know:

- Arrow form has no fall-through and can yield a value; `yield` returns from a block body.
- Guards: `case Rect r when r.w() == r.h() -> "square"`. Guarded cases must come before the unguarded case for the same type.
- Dominance: a more general pattern before a more specific one is a compile error.
- `case null ->` is allowed; without it a `null` selector throws `NullPointerException`, as switch always has.
- Enum and string switches gain the same arrow syntax; mixing `->` and `:` in one switch is illegal.

### Record patterns (Java 21)

Destructure in place, nested as deep as you like:

```java
record Line(Point from, Point to) {}

static String describe(Object o) {
    return switch (o) {
        case Line(Point(var x1, var y1), Point(var x2, var y2)) when x1 == x2 -> "vertical";
        case Line(Point from, Point to)                                        -> "line";
        case Point(int x, int y)                                               -> "point";
        default                                                                -> "other";
    };
}
```

Record patterns work in `instanceof` too. Unnamed pattern variables `_` arrive in Java 22.

## Worked example: modelling payment results

Together, sealed types, records and pattern matching model "one of these cases, each with its own data", and let the compiler check that every case is handled:

```java
sealed interface PaymentResult permits Approved, Declined, NeedsAction {}

record Approved(String transactionId, BigDecimal amount) implements PaymentResult {}
record Declined(String reason, boolean retryable) implements PaymentResult {}
record NeedsAction(URI redirectUrl) implements PaymentResult {}

static String describe(PaymentResult result) {
    return switch (result) {
        case Approved(String id, BigDecimal amount) -> "Paid " + amount + " (" + id + ")";
        case Declined(String reason, boolean retryable) when retryable -> "Declined, try again: " + reason;
        case Declined(String reason, boolean retryable) -> "Declined: " + reason;
        case NeedsAction(URI url) -> "Complete verification at " + url;
    }; // no default: the compiler knows these are all the cases
}
```

What each feature contributes:

| Feature | Contribution |
| --- | --- |
| `sealed … permits` | The set of cases is closed and known to the compiler |
| Records | Each case is an immutable data carrier with `equals`, `hashCode` and `toString` |
| Record patterns | `case Approved(String id, BigDecimal amount)` tests the type and extracts fields in one step |
| Guards (`when`) | Refine a case with a condition; order matters, more specific first |
| Exhaustive `switch` | Adding a fourth result type turns every unhandled `switch` into a compile error |

Before these features, the same design needed a class hierarchy with a visitor, or an enum plus nullable fields and `instanceof` chains that the compiler couldn't check.

## Records in more depth

```java
public record Money(BigDecimal amount, Currency currency) {
    public Money { // compact constructor: validate and normalise
        Objects.requireNonNull(amount);
        Objects.requireNonNull(currency);
        if (amount.scale() > currency.getDefaultFractionDigits()) {
            throw new IllegalArgumentException("too many decimals for " + currency);
        }
    }

    public static Money of(String amount, String currencyCode) { // static factory
        return new Money(new BigDecimal(amount), Currency.getInstance(currencyCode));
    }

    public Money plus(Money other) { // "withers" return new instances
        if (!currency.equals(other.currency)) throw new IllegalArgumentException("currency mismatch");
        return new Money(amount.add(other.amount), currency);
    }
}
```

- Fields are `private final`; there are no setters, so "changing" a record means creating a new one.
- Records are **shallowly** immutable: a `record Team(List<String> members)` can still have its list mutated. Copy defensively in the compact constructor (`members = List.copyOf(members);`).
- Records can implement interfaces and have static and instance methods, but can't extend classes (they implicitly extend `java.lang.Record`).
- Good uses: DTOs, value objects, map keys, multiple return values, events. Not a fit for JPA entities, which need mutability and a no-argument constructor.

## Enums with behaviour

Enums are full classes with a fixed set of instances, which makes them good for small state machines:

```java
enum OrderStatus {
    PLACED { Set<OrderStatus> next() { return EnumSet.of(PAID, CANCELLED); } },
    PAID { Set<OrderStatus> next() { return EnumSet.of(SHIPPED, REFUNDED); } },
    SHIPPED { Set<OrderStatus> next() { return EnumSet.of(DELIVERED); } },
    DELIVERED { Set<OrderStatus> next() { return EnumSet.noneOf(OrderStatus.class); } },
    CANCELLED { Set<OrderStatus> next() { return EnumSet.noneOf(OrderStatus.class); } },
    REFUNDED { Set<OrderStatus> next() { return EnumSet.noneOf(OrderStatus.class); } };

    abstract Set<OrderStatus> next();

    boolean canMoveTo(OrderStatus target) { return next().contains(target); }
}
```

Use `EnumMap` and `EnumSet` for enum keys: they are backed by arrays and bit vectors and are much faster than hash-based collections. Persist enums by name (not `ordinal()`), since reordering the constants changes ordinals.

## The TypeScript mapping

| TypeScript | Java 21 |
|---|---|
| `type Shape = Circle \| Rect` | `sealed interface Shape permits Circle, Rect` |
| `{ kind: 'circle', r: number }` | `record Circle(double r) implements Shape` |
| `switch (s.kind)` with `never` check | `switch (s)` with pattern cases, exhaustiveness built in |
| `const { x, y } = p` | `if (p instanceof Point(var x, var y))` |
| string literal union / `enum` | `enum` with fields and methods |
| `readonly` object | record |

## Common interview questions

**What does a record give you and what does it take away?**
It generates the constructor, accessors, `equals`, `hashCode` and `toString` for a final, immutable set of components. It takes away mutable fields, inheritance from a class, and the ability to hide the representation. Use it for values and DTOs, not for entities or anything with behaviour-heavy state.

**What is a compact constructor?**
A canonical constructor written without a parameter list. Its body runs before the fields are assigned, so you validate or normalise the parameters (`strip`, `List.copyOf`) and the assignments happen automatically afterwards.

**Why can you compare enums with `==`?**
Each constant is a single instance created when the enum class loads, so reference equality is value equality. `==` is also null-safe and compile-time type-checked, which `equals` is not.

**Why avoid `ordinal()` in persistence?**
It is just the declaration index; inserting or reordering constants changes it and silently remaps stored data. Persist `name()` or an explicit code field with a lookup.

**What problem do sealed types solve?**
They make a hierarchy closed so the compiler can check a `switch` for exhaustiveness. That turns "I added a subtype and forgot a branch" into a compile error, the same safety a discriminated union gives in TypeScript.

**What is the difference between `EnumMap` and `HashMap` for enum keys?**
`EnumMap` is an array indexed by ordinal: no hashing, no boxing of hash codes, iteration in declaration order, less memory. Behaviourally it is a `Map`, so there is no reason to prefer `HashMap` when keys are an enum.

**When does a switch need a `default`?**
When the selector type is not sealed (or is an enum but you want to survive new constants without recompiling), or when the cases are not exhaustive. With a sealed type and all cases listed, omit `default` so the compiler catches new subtypes.

**What happens if you switch on `null`?**
A `NullPointerException` unless the switch has a `case null` (or `case null, default`). This applies to all switches, including the old string and enum forms.

## Pitfalls

- Assuming records are deeply immutable when they hold mutable collections.
- Using records for JPA entities.
- Storing `ordinal()` values in databases or APIs.
- Putting a broad pattern before a more specific one in a `switch` (the compiler reports it as dominated).
- Adding a `default` branch to a switch over a sealed type, which hides missing cases when new types are added.

## Key takeaways

- Records are concise immutable data carriers; validate in the compact constructor and copy mutable inputs.
- Enums are classes with a fixed set of instances; they can carry fields and behaviour.
- Sealed interfaces close a hierarchy so the compiler knows every subtype.
- Pattern matching for `instanceof` and `switch`, with record patterns and guards, replaces casts and visitor boilerplate.
- Sealed types plus exhaustive switches turn "forgot a case" into a compile error.
