---
title: Java Language
order: 1
module: java-language
summary: Types and equality, strings, records and sealed types, exceptions, generics, lambdas, streams, Optional and platform facts.
---

## Is Java pass-by-value or pass-by-reference?

Always pass-by-value. For objects the value copied is the reference, so a method can mutate the object it was handed but cannot make the caller's variable point at a different object. Same semantics as JavaScript.

## What does `var` do in Java, and how is it different from `let`?

It infers the static type of a local variable from its initializer, and that type is then fixed. It is not dynamic typing: you cannot later assign a different type, and it is only allowed for locals with an initializer, never fields or parameters. Reassignment of the same type is allowed, so it is a typed `let`, not a `const`.

## Why does `Integer a = 127, b = 127; a == b` print true but with 128 it prints false?

`Integer.valueOf` caches instances from -128 to 127, so both variables refer to the same object. Outside the range each autoboxing allocates a new `Integer`, and `==` compares references. Use `equals` or compare unboxed `int` values.

## What is the string pool?

A JVM-maintained table of interned strings. Literals and compile-time constant expressions resolve to the same pooled instance, so `"a" == "a"` is true. `new String("a")` creates a separate object; `intern()` returns the pooled one. Never rely on it; compare strings with `equals`.

## Why is `String` immutable?

So it can be shared safely across threads and used as a map key without copies, its hash code can be cached, the string pool can exist, and validated values like paths or class names cannot change after checking. The cost is a new object per modification, which `StringBuilder` addresses for loops.

## What happens if you override `equals` but not `hashCode`?

Two objects that are `equals` may have different hash codes, so a `HashMap` or `HashSet` puts them in different buckets. `map.get(equalKey)` misses and a set accepts duplicates. The contract says equal objects must have equal hash codes.

## Why must the parameter of `equals` be `Object`?

`equals(MyType other)` is an overload, not an override of `Object.equals(Object)`. Collections call the `Object` version, so your overload is never used. Annotate `@Override` so the compiler catches it.

## When is `==` on objects correct?

When you are asking about identity: enum constants, sentinels, the `this == o` fast path inside `equals`, or checking whether a cache returned the same instance. For any value comparison use `equals`.

## Why `BigDecimal` for money, and what is the common mistake?

Binary floating point cannot represent most decimal fractions exactly, so sums of prices drift. `BigDecimal` is exact decimal arithmetic. The mistake is `new BigDecimal(0.1)`, which captures the already-inexact double; use `new BigDecimal("0.1")` or `BigDecimal.valueOf`.

## What does a record generate for you?

Private final fields for each component, a canonical constructor, accessor methods named after the components, and `equals`, `hashCode` and `toString` over all components. The class is implicitly final and cannot declare extra instance fields.

## What is a compact constructor in a record?

The canonical constructor written without a parameter list. Its body runs before the fields are assigned, so you use it to validate or normalise the parameters, such as `List.copyOf` on a collection component, and the assignments happen automatically afterwards.

## When would you not use a record?

When the type needs mutable state or a lifecycle, when you need to hide the representation, when it is a JPA entity needing a no-arg constructor and setters, or when there are many optional fields and a builder would be clearer.

## Why is it safe to compare enums with `==`?

Each constant is a single instance created when the enum class is initialised, so reference equality is value equality. `==` is also null-safe and type-checked at compile time, which `equals` is not.

## Why should you never persist `ordinal()`?

It is the declaration index. Inserting or reordering constants changes it and silently remaps every stored value. Persist `name()` or an explicit code with a lookup method.

## What does a sealed interface buy you?

A closed set of permitted subtypes, so a `switch` over it without a `default` is checked for exhaustiveness. Adding a subtype becomes a compile error in every switch that does not handle it, the same safety a discriminated union gives in TypeScript.

## What happens when you `switch` on a null reference?

A `NullPointerException`, in every switch form, unless the switch has a `case null` (or `case null, default`). Pattern-matching switches added the ability to handle null explicitly; they did not change the default.

## What is the difference between checked and unchecked exceptions?

Checked exceptions extend `Exception` but not `RuntimeException`; a method must declare or catch them. Unchecked ones extend `RuntimeException` or `Error` and need no declaration. Modern practice uses unchecked for most failures and reserves checked for cases the direct caller can realistically recover from.

## What does try-with-resources guarantee?

Every `AutoCloseable` declared in the header is closed in reverse order, whether or not the body throws. If both the body and `close()` throw, the body's exception propagates and the close exception is attached as suppressed, instead of being lost as in a naive `finally`.

## Can a `finally` block change what a method returns?

Yes, if it contains its own `return`, which also discards any exception in flight. Assigning to a local inside `finally` does not change an already-evaluated return value. A `return` in `finally` is considered a bug.

## Why is throwing an exception expensive?

Constructing one calls `fillInStackTrace`, which walks the entire call stack. Deep stacks and hot paths make it dominate. That is why exceptions should not be used for expected control flow like parsing or loop exits.

## How do you throw a checked exception from inside a lambda?

The standard functional interfaces do not declare any, so you catch it inside the lambda and wrap it in an unchecked exception such as `UncheckedIOException`, define your own functional interface whose method declares `throws`, or use a plain loop instead of a stream.

## Why is `List<Integer>` not a subtype of `List<Number>`?

Generics are invariant. If the assignment were allowed, code holding the `List<Number>` view could add a `Double`, corrupting the `List<Integer>` with no runtime check. Use `List<? extends Number>` when you only read from the list.

## Explain PECS.

Producer extends, consumer super. A parameter you only read from is declared `? extends T` so any subtype collection works; a parameter you only write to is `? super T` so any supertype collection can accept your values. `Collections.copy(List<? super T> dest, List<? extends T> src)` shows both.

## What is type erasure and what does it cost?

The compiler verifies generics and then erases type arguments to their bounds, so at runtime `List<String>` is just `List`. You lose `instanceof List<String>`, `new T()`, generic arrays, overloading on type arguments, and a `ClassCastException` can surface far from the unchecked cast that caused it.

## What is a raw type and why avoid it?

A generic type used without type arguments, like `List list`. It disables generic checking on that reference, so wrong-typed inserts compile and fail at the read site. It exists only for pre-generics compatibility; use `List<?>` for "a list of anything".

## Why can't you write `new T[]` in a generic class?

Array stores are checked at runtime against the array's element class, and erasure removes the information needed for that check, so the JVM cannot keep a generic array type-safe. `ArrayList` works around it with an `Object[]` and a cast on read.

## What is a functional interface?

An interface with exactly one abstract method, which makes it a valid target for a lambda or method reference. Default and static methods do not count. `@FunctionalInterface` asks the compiler to enforce the single-method rule.

## Why must a variable captured by a lambda be effectively final?

The lambda captures the variable's value, not the variable, because the stack frame may be gone when the lambda runs, possibly on another thread. Allowing reassignment would create two diverging copies. Use an `AtomicInteger` or restructure as a reduction.

## How is a lambda different from an anonymous inner class?

`this` inside a lambda is the enclosing instance; inside an anonymous class it is the anonymous object. Lambdas have no fields, cannot shadow local variables, only target functional interfaces, and compile to an `invokedynamic` call site instead of a separate class file.

## What are the four kinds of method reference?

Static (`Integer::parseInt`), bound instance (`System.out::println`, captures the receiver now), unbound instance (`String::toUpperCase`, the first argument becomes the receiver), and constructor (`ArrayList::new`, `int[]::new`).

## Why does `orElseGet` exist when `orElse` already does?

`orElse(x)` evaluates `x` eagerly, every time, even if the `Optional` is present. `orElseGet(supplier)` only calls the supplier when the value is absent, which matters when the default is expensive or has side effects.

## What is the difference between intermediate and terminal stream operations?

Intermediate operations return a new stream and are lazy; they just record a step. The terminal operation triggers traversal and produces a result or side effect. Nothing runs without a terminal op, and a stream cannot be reused after one.

## Why does `Collectors.toMap` throw `IllegalStateException`?

There is no default merge policy, so a duplicate key is treated as an error. Pass a merge function as the third argument. It also throws `NullPointerException` for null values. If several values per key are expected, use `groupingBy`.

## When should you not use a parallel stream?

When the work is I/O-bound, per-element cost is tiny, the source splits poorly (`LinkedList`, `iterate`), order matters, or you are inside a server handling concurrent requests, because all parallel streams share the common fork-join pool. Measure first; most pipelines get slower.

## What is the difference between `map` and `flatMap` on a stream?

`map` transforms each element to exactly one element. `flatMap` maps each element to a stream and concatenates the results, flattening one-to-many relationships. On `Optional`, `flatMap` is for mappers that themselves return an `Optional`.

## Why shouldn't `Optional` be used as a field or method parameter?

It adds a wrapper callers must unwrap, is not `Serializable`, and the `Optional` reference itself can still be null. It is designed as a return type to signal "may be absent". Use nullable fields with proper accessors and overloads for optional parameters.

## What is the difference between JDK, JRE and JVM?

The JVM executes bytecode and provides GC and JIT compilation. The JRE is the JVM plus the standard class library. The JDK adds development tools such as `javac`, `jshell` and `jlink`. Since Java 11 only the JDK is distributed.

## Which Java features would you name as arriving in 8, 17 and 21?

8: lambdas, streams, `Optional`, `java.time`, default methods. 17: sealed classes final, records and `instanceof` patterns already final from 16, text blocks from 15. 21: virtual threads, pattern matching for switch, record patterns, sequenced collections, generational ZGC.

## What is the difference between `Instant`, `LocalDateTime` and `ZonedDateTime`?

`Instant` is an absolute UTC timestamp. `LocalDateTime` has no zone, so it cannot become an instant without one. `ZonedDateTime` is an instant plus a zone with DST rules. Store `Instant`, use `ZonedDateTime` for calendar arithmetic in a zone, `LocalDate` for dates without time.

## How do you read a Java stack trace?

The first line is the outermost exception and message; frames below it list the call stack with the throw site first. Look for the first frame in your own package to find where to open, and read the last `Caused by:` block for the root cause. `... n more` means those frames repeat the enclosing trace.
