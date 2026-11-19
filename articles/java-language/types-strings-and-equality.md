---
title: Types, Strings and Equality
order: 2
summary: Primitives vs wrappers and the autoboxing traps, String immutability and the pool, the equals/hashCode contract, compareTo, Objects helpers, text blocks and formatting.
---

Half of the "what does this print?" questions in Java interviews come from three sources: `==` on wrappers, `==` on strings, and a class that overrides `equals` without `hashCode`. Know these cold.

## Primitives and wrappers

| Primitive | Wrapper | Size | Default in a field |
|---|---|---|---|
| `boolean` | `Boolean` | JVM-defined | `false` |
| `byte` / `short` / `int` / `long` | `Byte` / `Short` / `Integer` / `Long` | 8 / 16 / 32 / 64 bits | `0` |
| `char` | `Character` | 16 bits (UTF-16 unit) | `'\u0000'` |
| `float` / `double` | `Float` / `Double` | 32 / 64 bits | `0.0` |

Fields get defaults; local variables must be definitely assigned before use or the code will not compile. Wrapper fields default to `null`.

### Autoboxing and its traps

The compiler inserts `Integer.valueOf(i)` and `x.intValue()` for you. Three things go wrong:

```java
Integer a = 127, b = 127;
Integer c = 128, d = 128;
System.out.println(a == b);        // true  — cached instances
System.out.println(c == d);        // false — distinct objects
System.out.println(c.equals(d));   // true

Integer n = null;
int m = n;                         // NullPointerException on unboxing

Long big = 1L;
System.out.println(big.equals(1)); // false — 1 autoboxes to Integer, not Long
```

- `Integer.valueOf` caches −128 to 127 (`Byte`, `Short`, `Long`, `Character` 0–127 similarly; `Double`/`Float` never). `==` on wrappers compares references, so it "works" for small numbers and breaks in production.
- `List<Integer>.remove(1)` removes the element at index 1; `remove(Integer.valueOf(1))` removes the value 1. Overload resolution prefers the exact primitive match.
- Boxing in a hot loop allocates. `Map<String, Integer>` counters do `get`, unbox, add, box, `put` for each increment; prefer `merge(key, 1, Integer::sum)` and primitive arrays for tight loops.

### Numeric gotchas

- Integer overflow wraps silently. `Math.addExact`, `multiplyExact` throw `ArithmeticException` instead.
- `int / int` truncates toward zero; `%` keeps the sign of the dividend (`-7 % 3` is `-1`). `Math.floorMod` for a non-negative result.
- `0.1 + 0.2 != 0.3`, same as JS. Money uses `BigDecimal` with a `String` constructor (`new BigDecimal("0.1")`, never `new BigDecimal(0.1)`).
- Widening (`int` to `long` to `double`) is implicit; narrowing needs a cast and truncates: `(int) 3.99` is `3`, `(int) 1e10` saturates to `Integer.MAX_VALUE`.
- `char` arithmetic yields `int`: `'a' + 1` is `98`; `(char) ('a' + 1)` is `'b'`.

## Strings

`String` is immutable and `final`. Every "mutating" method returns a new string. This buys safe sharing between threads, safe use as map keys, cached `hashCode`, and the string pool.

### The pool and `==`

```java
String a = "hello";
String b = "hello";
String c = new String("hello");
String d = "hel" + "lo";                // constant-folded at compile time
String e = c.intern();

a == b        // true  — both literals point into the pool
a == c        // false — new String creates a distinct object
a == d        // true  — compile-time constant goes to the pool
a == e        // true  — intern() returns the pooled instance
a.equals(c)   // true  — always compare content with equals
```

Rule: never use `==` on strings except when you are deliberately testing identity. If an interviewer asks about `intern()`, say it deduplicates at the cost of a global lookup and is rarely worth it outside parsers.

### Building strings

- `s1 + s2` in a single expression is fine; since Java 9 the compiler uses `invokedynamic` to build it efficiently.
- Concatenation inside a loop is O(n²). Use `StringBuilder` (not `StringBuffer`, whose synchronisation you almost never need).
- `String.join(",", list)`, `Collectors.joining(", ", "[", "]")`, `"ab".repeat(3)`.

```java
var sb = new StringBuilder();
for (var part : parts) sb.append(part).append('/');
if (!sb.isEmpty()) sb.setLength(sb.length() - 1);   // drop trailing slash
String path = sb.toString();
```

### Useful methods you may not know from JS

`isBlank()`, `strip()` (Unicode-aware `trim`), `lines()`, `chars()` (an `IntStream`), `formatted(...)`, `repeat(n)`, `compareToIgnoreCase`, `regionMatches`, `codePoints()` for correct emoji handling, `String.valueOf(x)` for null-safe conversion.

`length()` counts UTF-16 units; `codePointCount(0, len)` counts characters. `charAt` returns a `char`, not a one-character string.

### Text blocks and formatting

```java
String json = """
    {
      "name": "%s",
      "age": %d
    }
    """.formatted(name, age);
```

- The closing `"""` position sets the indentation that is stripped. A trailing `\` at a line end suppresses the newline.
- `String.format("%,.2f", 1234.5)` gives `1,234.50`; `%05d`, `%-10s`, `%x`, `%n` for a platform newline.
- `MessageFormat` and `java.text.NumberFormat` for locale-aware output; `String.format` with no locale uses the default locale, which bites in tests on machines set to a comma decimal separator.

## The `equals` / `hashCode` contract

`Object.equals` is identity. Override it and you must override `hashCode`, because `HashMap`, `HashSet` and friends choose the bucket by `hashCode` first and only then call `equals` on candidates.

Contract:

1. `equals` is reflexive, symmetric, transitive, consistent, and `x.equals(null)` is `false`.
2. Equal objects have equal hash codes. (Unequal objects may share a hash code; that is a collision, not a bug.)
3. Neither may depend on mutable state used as a map key, or the entry becomes unreachable.

```java
public final class Money {
    private final String currency;
    private final long cents;

    public Money(String currency, long cents) {
        this.currency = Objects.requireNonNull(currency);
        this.cents = cents;
    }

    @Override public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Money other)) return false;      // also rejects null
        return cents == other.cents && currency.equals(other.currency);
    }

    @Override public int hashCode() { return Objects.hash(currency, cents); }

    @Override public String toString() { return currency + " " + cents / 100.0; }
}
```

- The parameter type must be `Object`; `equals(Money o)` is an overload, not an override, and `HashMap` will never call it. Always annotate `@Override`.
- `instanceof` versus `getClass()`: `instanceof` lets subclasses compare equal to the parent, which breaks symmetry if the subclass adds state; `getClass() ==` is strict. Making the class `final` sidesteps the question. See the inheritance article.
- `Objects.hash(a, b)` allocates a varargs array; fine for most code, hand-roll `31 * h + ...` in hot paths.
- Records generate all three from their components. Reach for a record whenever a class is just data.

Arrays: `equals` on an array is identity. Use `Arrays.equals(a, b)` and `Arrays.hashCode(a)` (`deepEquals` for nested arrays).

## `compareTo` and `Comparable`

`Comparable<T>` defines natural order. `compareTo` returns negative, zero or positive, and should be consistent with `equals` (`compareTo == 0` iff `equals`), otherwise `TreeMap`/`TreeSet` and `HashMap` disagree about which objects are "the same".

```java
record Version(int major, int minor) implements Comparable<Version> {
    public int compareTo(Version o) {
        int c = Integer.compare(major, o.major);
        return c != 0 ? c : Integer.compare(minor, o.minor);
    }
}
```

Never write `return this.x - o.x` for ints: it overflows for large values of opposite sign. Use `Integer.compare`. Details and `Comparator` chains in the ordering article.

## `java.util.Objects`

| Helper | Use |
|---|---|
| `Objects.equals(a, b)` | Null-safe equality; `true` when both are `null` |
| `Objects.hash(a, b, c)` | Combined hash for `hashCode` |
| `Objects.requireNonNull(x, "msg")` | Fail fast in constructors |
| `Objects.requireNonNullElse(x, d)` | `x ?? d` |
| `Objects.toString(x, "n/a")` | Null-safe `toString` with default |
| `Objects.isNull` / `nonNull` | As method references in streams |
| `Objects.checkIndex(i, n)` | Bounds check with a standard exception |

## Equality decision table

| Comparing | Use |
|---|---|
| Two primitives | `==` |
| Two wrappers | `.equals()` or unbox first; never `==` |
| Two strings | `.equals()` / `equalsIgnoreCase()` |
| Possibly-null references | `Objects.equals(a, b)` |
| Arrays by content | `Arrays.equals` / `deepEquals` |
| Identity (same object) | `==` — say so in a comment |
| Enum values | `==` is safe and null-safe; `equals` also fine |
| `BigDecimal` by value ignoring scale | `compareTo(x) == 0` (`equals` treats `2.0` and `2.00` as different) |

## Worked example: a correct value class

```java
public final class EmailAddress implements Comparable<EmailAddress> {
    private final String value; // normalised, immutable

    public EmailAddress(String raw) {
        Objects.requireNonNull(raw, "email");
        String trimmed = raw.strip().toLowerCase(Locale.ROOT);
        if (!trimmed.contains("@")) throw new IllegalArgumentException("Invalid email: " + raw);
        this.value = trimmed;
    }

    public String value() { return value; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof EmailAddress other)) return false;
        return value.equals(other.value);
    }

    @Override
    public int hashCode() { return value.hashCode(); }

    @Override
    public int compareTo(EmailAddress other) { return value.compareTo(other.value); }

    @Override
    public String toString() { return value; }
}
```

Why each part matters:

- `final` class and `final` field: the object can't change after construction, so its hash code stays valid while it sits in a `HashSet` or is a `HashMap` key.
- Normalising in the constructor (`strip`, lower case with `Locale.ROOT`) means `"Ana@Example.com "` and `"ana@example.com"` are equal.
- `equals` and `hashCode` use the same field, keeping the contract: equal objects have equal hash codes.
- `compareTo` is **consistent with equals** (returns 0 exactly when `equals` is true), so sorted collections like `TreeSet` agree with hash-based ones.
- `Locale.ROOT` avoids the Turkish-locale bug where `"TITLE".toLowerCase()` produces a dotless ı.

A record gives you the same `equals`/`hashCode`/`toString` with far less code: `record EmailAddress(String value)` with a compact constructor for the validation.

## What goes wrong when the contract breaks

```java
class Point {
    int x, y;
    Point(int x, int y) { this.x = x; this.y = y; }
    @Override public boolean equals(Object o) {
        return o instanceof Point p && p.x == x && p.y == y;
    }
    // hashCode not overridden
}

Set<Point> points = new HashSet<>();
points.add(new Point(1, 2));
points.contains(new Point(1, 2)); // false: different identity hash codes, different buckets
```

And with a mutable key:

```java
Point p = new Point(1, 2); // assume hashCode is now correctly overridden
points.add(p);
p.x = 5; // the stored hash no longer matches
points.contains(p); // false, though p is in the set: it's in the bucket for (1, 2)
```

Both bugs are silent. That is why value types should be immutable and always override both methods together.

## Strings in memory

- `String` is immutable, which makes it safe to share, cache its hash code, and use as a map key.
- String **literals** are interned in the string pool, so `"a" == "a"` is `true`; strings built at runtime are separate objects, so `new String("a") == "a"` is `false`. Always compare with `equals`.
- Since Java 9, strings store Latin-1 text in one byte per character (compact strings), halving memory for most text.
- `+` in a loop creates a new string each iteration; the compiler optimises single expressions, but loops need a `StringBuilder`.
- Text blocks (`"""`) handle multi-line strings with sensible indentation.

## Common interview questions

**Why does `Integer a = 127, b = 127; a == b` print `true` but `128` prints `false`?**
`Integer.valueOf` caches instances from −128 to 127, so both variables reference the same object. Outside that range each boxing creates a new object and `==` compares references. Use `equals` or compare unboxed `int`s.

**What is the string pool?**
A JVM-level table of interned `String` instances. Literals and compile-time constants go there automatically, so identical literals share one object. `new String(...)` always creates a fresh object outside the pool; `intern()` returns the pooled one.

**Why is `String` immutable?**
Safe sharing across threads and map keys without defensive copies, a cacheable hash code, the string pool, and security (a path or class name cannot be changed after validation). The cost is allocation on every modification, which `StringBuilder` addresses.

**What happens if you override `equals` but not `hashCode`?**
Two equal objects may land in different `HashMap` buckets, so `map.get(equalKey)` misses and a `HashSet` accepts duplicates. The contract requires equal objects to have equal hashes.

**When is `==` on objects correct?**
When identity is the question: sentinels, enum constants, checking whether a cache returned the same instance, the `this == o` fast path inside `equals`. Everywhere else, use `equals`.

**`String`, `StringBuilder`, `StringBuffer`?**
`String` is immutable. `StringBuilder` is the mutable builder for single-threaded use. `StringBuffer` is the same API with synchronized methods, slower and rarely justified since two threads sharing one builder is a design smell.

**Why `BigDecimal` for money and what is the trap?**
Binary floating point cannot represent most decimal fractions exactly, so sums drift. `BigDecimal` is exact decimal arithmetic. The trap is `new BigDecimal(0.1)`, which captures the already-inexact double; use the `String` constructor or `BigDecimal.valueOf`, and set a `RoundingMode` for division.

**What is the difference between `equals` and `compareTo` returning 0?**
Nothing requires them to agree, but sorted collections use `compareTo` for membership while hash collections use `equals`. If they disagree, a `TreeSet` can reject an element a `HashSet` would accept. `BigDecimal` is the standard example of an inconsistent pair.

## Pitfalls

- Comparing strings or boxed numbers with `==`.
- Overriding `equals` without `hashCode`.
- Mutating objects used as hash keys.
- `Integer` caching: `Integer.valueOf(127) == Integer.valueOf(127)` is true but 128 isn't; never rely on it.
- Unboxing `null` (`int n = map.get(key);`) throws `NullPointerException`.
- Using `double` for money; use `BigDecimal` with an explicit scale and rounding mode.

## Key takeaways

- Primitives compare by value with `==`; objects need `equals`.
- Override `equals` and `hashCode` together, based on the same immutable fields.
- Keep `compareTo` consistent with `equals`.
- Strings are immutable and pooled for literals; build them in loops with `StringBuilder`.
- Records give correct value semantics for free.
