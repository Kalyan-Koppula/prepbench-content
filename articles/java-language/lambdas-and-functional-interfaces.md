---
title: Lambdas and Functional Interfaces
order: 6
summary: The java.util.function vocabulary, method references, effectively final, composition, and writing your own functional interface — what a JS developer must relearn about functions in Java.
---

In JavaScript a function is a value. In Java a lambda is an object that implements an interface with exactly one abstract method, and the compiler picks which interface from context. Everything about lambdas follows from that one sentence.

## Functional interfaces

A functional interface has exactly one abstract method (SAM). `default` and `static` methods do not count, nor do methods inherited from `Object` like `equals`.

```java
@FunctionalInterface
interface Validator<T> {
    boolean validate(T value);                              // the single abstract method

    default Validator<T> and(Validator<T> other) {          // allowed: default methods
        return v -> validate(v) && other.validate(v);
    }
    static <T> Validator<T> alwaysTrue() { return v -> true; }
}

Validator<String> notBlank = s -> !s.isBlank();
Validator<String> shortEnough = s -> s.length() < 20;
notBlank.and(shortEnough).validate("hi");                   // true
```

`@FunctionalInterface` is optional but makes the compiler reject a second abstract method. Write your own interface when the name carries meaning (`Validator`, `RetryPolicy`) or when the method must throw a checked exception; otherwise use the standard ones so callers can pass existing functions.

## The `java.util.function` vocabulary

| Interface | Method | JS shape | Typical use |
|---|---|---|---|
| `Supplier<T>` | `T get()` | `() => x` | Lazy values, factories, `orElseGet` |
| `Consumer<T>` | `void accept(T)` | `x => { }` | `forEach`, callbacks |
| `Function<T, R>` | `R apply(T)` | `x => y` | `map`, transformations |
| `Predicate<T>` | `boolean test(T)` | `x => bool` | `filter`, `removeIf` |
| `UnaryOperator<T>` | `T apply(T)` | `x => x'` | `replaceAll`, `Function<T,T>` |
| `BiFunction<T, U, R>` | `R apply(T, U)` | `(a, b) => c` | `Map.compute`, `reduce` with combiner |
| `BinaryOperator<T>` | `T apply(T, T)` | `(a, b) => c` | `reduce`, `merge` |
| `BiConsumer<T, U>` | `void accept(T, U)` | `(k, v) => { }` | `Map.forEach` |
| `BiPredicate<T, U>` | `boolean test(T, U)` | `(a, b) => bool` | Pairwise checks |
| `Runnable` | `void run()` | `() => { }` | Threads, executors |
| `Callable<V>` | `V call() throws Exception` | `async () => x` | Executor tasks that return or throw |
| `Comparator<T>` | `int compare(T, T)` | `(a, b) => n` | Sorting |

Primitive specialisations avoid boxing: `IntPredicate`, `IntFunction<R>`, `ToIntFunction<T>`, `IntUnaryOperator`, `IntBinaryOperator`, `LongSupplier`, `DoubleConsumer`, and so on. `IntStream.map` takes an `IntUnaryOperator`, not a `Function<Integer, Integer>`.

## Lambda syntax

```java
Runnable r = () -> System.out.println("hi");
Function<String, Integer> len = s -> s.length();
BiFunction<Integer, Integer, Integer> add = (a, b) -> a + b;
Comparator<String> byLen = (String a, String b) -> {      // explicit types and a block body
    return Integer.compare(a.length(), b.length());
};
```

- Parameter types are inferred from the target interface; you may write them when inference fails or for readability, and since 11 you may write `var`.
- A lambda has no identity you can rely on: `(() -> {}) == (() -> {})` is unspecified, and `this` inside a lambda is the enclosing instance, not the lambda.
- A lambda cannot be `null`-checked into existence or recursive without a holder; name it as a method and use a method reference for recursion.
- The same lambda text can target different interfaces; `Callable<Void>` versus `Runnable` ambiguity is resolved by whether the body returns a value.

## Method references

Four kinds, each sugar for a lambda:

| Kind | Reference | Equivalent lambda |
|---|---|---|
| Static | `Integer::parseInt` | `s -> Integer.parseInt(s)` |
| Bound instance | `System.out::println`, `prefix::concat` | `x -> System.out.println(x)` |
| Unbound instance | `String::toUpperCase` | `s -> s.toUpperCase()` (first arg is the receiver) |
| Constructor | `ArrayList::new`, `int[]::new` | `() -> new ArrayList<>()`, `n -> new int[n]` |

A bound reference captures the receiver when the reference is created. `this::handle` and `obj::method` keep `obj` alive for the lifetime of the lambda — the same closure-retains-object concern as in JS.

Pitfall: `Integer::compare` and `Integer::compareTo` are both valid as `Comparator<Integer>`; `String::valueOf` is overloaded and may be ambiguous where a lambda would not be.

## Effectively final

A lambda can read local variables from the enclosing scope only if they are final or effectively final (never reassigned after initialisation):

```java
int count = 0;
list.forEach(x -> count++);          // compile error: count is not effectively final

int[] box = {0};
list.forEach(x -> box[0]++);         // compiles; mutating through a reference is allowed, but a smell

var counter = new AtomicInteger();
list.forEach(x -> counter.incrementAndGet());   // the idiomatic escape hatch
```

Why: the lambda receives a copy of the variable's value, not a reference to the stack slot (locals can be gone when the lambda runs on another thread). Fields have no such restriction, which is why `this.count++` in a lambda compiles. JS closures capture bindings; Java lambdas capture values.

Loop variables in a classic `for (int i = 0; ...)` are not effectively final; the for-each variable and a copy `int j = i;` are.

## Composition

```java
Function<Integer, Integer> doubleIt = x -> x * 2;
Function<Integer, Integer> inc = x -> x + 1;
doubleIt.andThen(inc).apply(5);      // 11: double then increment
doubleIt.compose(inc).apply(5);      // 12: increment then double
Function.identity();                 // x -> x, for Collectors.toMap

Predicate<String> empty = String::isEmpty;
Predicate<String> nonEmpty = empty.negate();
Predicate<String> ok = nonEmpty.and(s -> s.length() < 10).or(s -> s.startsWith("!"));
Predicate.not(String::isBlank);     // static form, reads well in filter()

Consumer<String> log = System.out::println;
log.andThen(audit::record).accept("event");

Comparator.comparing(Person::lastName).thenComparing(Person::firstName).reversed();
```

Supplier-based laziness is a common pattern: `optional.orElseGet(() -> expensive())` versus `orElse(expensive())`, which evaluates eagerly. Same for `logger.debug(() -> buildMessage())` and `Objects.requireNonNullElseGet`.

## Currying and partial application

Java has no built-in currying; you nest functions:

```java
Function<Integer, Function<Integer, Integer>> add = a -> b -> a + b;
Function<Integer, Integer> add5 = add.apply(5);
add5.apply(3);                       // 8
```

It works but the types are noisy, which is why Java code tends to use small classes or records instead of curried functions.

## Lambdas versus anonymous classes

| | Lambda | Anonymous class |
|---|---|---|
| `this` | Enclosing instance | The anonymous instance |
| Can have state/fields | No | Yes |
| Can implement several methods | No | Yes |
| Shadowing enclosing locals | Not allowed | Allowed |
| Bytecode | `invokedynamic` + synthetic method, no extra class file | A generated `Outer$1.class` |
| Target | Functional interface only | Any interface or abstract class |

Use an anonymous class when you need an abstract class, state, or more than one method; otherwise a lambda.

## Worked example: a validation pipeline

Functional interfaces compose small rules into bigger ones without new classes:

```java
record User(String email, String name, int age) {}

Predicate<User> hasEmail = u -> u.email() != null && u.email().contains("@");
Predicate<User> hasName = u -> u.name() != null && !u.name().isBlank();
Predicate<User> isAdult = u -> u.age() >= 18;

Predicate<User> canRegister = hasEmail.and(hasName).and(isAdult);

// Validation with messages: a list of (rule, message) pairs
record Rule<T>(Predicate<T> check, String message) {}

List<Rule<User>> rules = List.of(
    new Rule<>(hasEmail, "email is invalid"),
    new Rule<>(hasName, "name is required"),
    new Rule<>(isAdult, "must be 18 or older"));

Function<User, List<String>> validate = user -> rules.stream()
    .filter(rule -> !rule.check().test(user))
    .map(Rule::message)
    .toList();

validate.apply(new User("ana@example.com", "", 17)); // [name is required, must be 18 or older]
```

New rules are data, not code changes in a validator class. This is the strategy pattern without the boilerplate: each lambda is a strategy object implementing a one-method interface.

## How lambdas are compiled

A lambda is not an anonymous inner class, even though it can often replace one:

- The compiler moves the lambda body into a private method of the enclosing class.
- At the call site it emits an `invokedynamic` instruction. The first time it runs, the JVM uses `LambdaMetafactory` to generate a small class implementing the functional interface, and links the call site to it.
- Non-capturing lambdas are typically created once and reused (effectively a singleton); capturing lambdas create a small object holding the captured values.

Consequences: no extra `.class` file per lambda, cheaper start-up than anonymous classes, and `this` inside a lambda refers to the enclosing instance, not to the lambda.

## Checked exceptions and lambdas

The standard functional interfaces don't declare checked exceptions, so this doesn't compile:

```java
List<Path> files = ...;
files.stream().map(Files::readString).toList(); // readString throws IOException
```

Options, from simplest:

1. Use a loop where the checked exception can propagate normally.
2. Wrap and rethrow as unchecked inside the lambda: `catch (IOException e) { throw new UncheckedIOException(e); }`.
3. Define your own functional interface that declares the exception, with an adapter:

```java
@FunctionalInterface
interface ThrowingFunction<T, R> {
    R apply(T t) throws Exception;

    static <T, R> Function<T, R> unchecked(ThrowingFunction<T, R> f) {
        return t -> {
            try {
                return f.apply(t);
            } catch (RuntimeException e) {
                throw e;
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        };
    }
}

files.stream().map(ThrowingFunction.unchecked(Files::readString)).toList();
```

## Common interview questions

**What is a functional interface?**
An interface with exactly one abstract method, which is what makes it a valid target for a lambda or method reference. Default and static methods are allowed. `@FunctionalInterface` asks the compiler to enforce the single-method rule.

**Why must captured variables be effectively final?**
A lambda captures the value of a local, not the variable, because the stack frame may be gone when the lambda runs, possibly on another thread. Allowing mutation would mean two divergent copies. Use an `AtomicInteger`, a one-element array or, better, restructure to a stream/reduce.

**How is a lambda different from an anonymous inner class?**
`this` means the enclosing instance in a lambda and the anonymous object in the class; lambdas carry no fields, cannot shadow locals, and compile to an `invokedynamic` call site rather than a separate class file. Lambdas only target functional interfaces.

**What is a method reference and when is it ambiguous?**
Sugar for a lambda that just calls one method: static, bound instance, unbound instance or constructor. Ambiguity arises with overloaded methods like `String::valueOf`, where the compiler cannot pick an overload from the target type; write the lambda explicitly.

**`Supplier` versus a value: why `orElseGet`?**
`orElse(x)` evaluates `x` whether or not it is needed; `orElseGet(supplier)` only calls the supplier when the `Optional` is empty. Prefer the supplier form whenever the default is expensive or has side effects.

**How do you throw a checked exception from a lambda?**
You cannot through the standard interfaces. Either catch and wrap it in an unchecked exception inside the lambda (`UncheckedIOException`), define your own functional interface whose method declares `throws`, or use a loop instead of a stream.

**What is `Function.identity()` and why not `x -> x`?**
They are equivalent. `identity()` reads as intent in `Collectors.toMap(Function.identity(), ...)` and avoids allocating a new lambda per call site, which is a minor point; readability is the real reason.

**What does `invokedynamic` have to do with lambdas?**
Each lambda expression compiles to a private synthetic method plus an `invokedynamic` call site that, on first execution, asks `LambdaMetafactory` to spin up a class implementing the target interface. That is why lambdas do not produce `Outer$1.class` files and why non-capturing lambdas can be cached as singletons.

## Pitfalls

- Mutating captured local variables (not allowed) or shared collections from inside lambdas (allowed but unsafe with parallel streams).
- Overloaded methods taking different functional interfaces, which make lambdas ambiguous to the compiler.
- Long multi-line lambdas: extract a named method and use a method reference.
- Expecting `this` inside a lambda to mean the lambda.
- Swallowing checked exceptions inside lambdas instead of wrapping them.

## Key takeaways

- A functional interface has one abstract method; lambdas and method references implement it.
- Learn the core vocabulary: `Function`, `Predicate`, `Supplier`, `Consumer`, their `Bi` and primitive variants.
- Captured locals must be effectively final; captured fields and objects can still change.
- Compose with `andThen`, `compose`, `and`, `or`, `negate`.
- Lambdas compile to `invokedynamic` and private methods, not inner classes.
