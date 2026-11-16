---
title: Generics Without Tears
order: 5
summary: Type parameters, bounds, wildcards and PECS, erasure and what it breaks, generic methods, raw types, and why arrays and generics do not mix.
---

Java generics look like TypeScript generics and behave differently in exactly the places interviewers probe: invariance, wildcards, and erasure. If you can explain why `List<Dog>` is not a `List<Animal>` and what `? super T` is for, you pass this section.

## Basics

```java
public class Box<T> {
    private T value;
    public void set(T v) { value = v; }
    public T get() { return value; }
}

Box<String> b = new Box<>();     // diamond infers the argument
```

- Type parameters are reference types only. `Box<int>` does not compile; use `Box<Integer>` or a primitive specialisation like `IntStream`.
- Conventional names: `T` type, `E` element, `K`/`V` key/value, `R` result. Single letters are not required, just expected.
- A generic method declares its own parameter before the return type: `static <T> List<T> listOf(T... xs)`.

```java
static <T extends Comparable<T>> T max(List<T> xs) {
    T best = xs.get(0);
    for (T x : xs) if (x.compareTo(best) > 0) best = x;
    return best;
}
```

Multiple bounds: `<T extends Number & Comparable<T>>`. A class bound must come first; the rest must be interfaces.

## Invariance

`List<Dog>` is not a subtype of `List<Animal>`, even though `Dog` extends `Animal`:

```java
List<Dog> dogs = new ArrayList<>();
List<Animal> animals = dogs;     // compile error
animals.add(new Cat());          // if that were allowed, dogs would contain a Cat
```

Arrays are covariant (`Dog[]` is an `Animal[]`), which is why they need a runtime `ArrayStoreException` check. Generics chose compile-time safety instead; wildcards give the flexibility back.

## Wildcards and PECS

| Form | Reads as | You can | You cannot |
|---|---|---|---|
| `List<? extends T>` | Some unknown subtype of T | `get` as `T` | `add` anything but `null` |
| `List<? super T>` | Some unknown supertype of T | `add` a `T` | `get` anything but `Object` |
| `List<?>` | Any list | `get` as `Object`, `size`, `clear` | `add` anything but `null` |

PECS: Producer `extends`, Consumer `super`. If a parameter only supplies values, take `? extends`; if it only receives values, take `? super`. The JDK's own signature is the canonical example:

```java
public static <T> void copy(List<? super T> dest, List<? extends T> src) {
    for (T t : src) dest.add(t);
}

List<Number> nums = new ArrayList<>(List.of(0.0, 0.0, 0.0));   // copy needs dest.size() >= src.size()
List<Integer> ints = List.of(1, 2, 3);
Collections.copy(nums, ints);     // T inferred as Integer; Number is a super of Integer
```

Other JDK spots: `Collections.sort(List<T>, Comparator<? super T>)` (a `Comparator<Object>` can sort strings), `Stream.map(Function<? super T, ? extends R>)`, `Collection.addAll(Collection<? extends E>)`.

Do not use wildcards in return types; callers get a type they cannot do anything with. Do not use them when the method needs both to read and write the same list; use a named type parameter.

## Erasure

Generic type arguments exist only at compile time. After compilation `List<String>` and `List<Integer>` are the same class `List`, and `T` becomes its bound (`Object` or the first bound). Everything surprising about Java generics follows from this.

| Consequence | Example |
|---|---|
| Cannot test the argument at runtime | `x instanceof List<String>` is a compile error; `instanceof List<?>` is fine |
| Cannot `new T()` or `new T[]` | No class to instantiate; pass a `Class<T>` or a `Supplier<T>` instead |
| Cannot overload on type arguments | `f(List<String>)` and `f(List<Integer>)` have the same erasure |
| Static members cannot use `T` | There is one class, not one per argument |
| Unchecked casts compile with a warning | `(T) obj` is a no-op cast; the `ClassCastException` appears later, somewhere else |
| `List<String>.class` does not exist | Jackson needs `TypeReference<List<String>>` to recover the argument from a subclass's signature |
| Primitives not allowed | `T` must erase to a reference type |

Why erasure: backward compatibility with pre-5 code and bytecode. Kotlin inherits it; C# reifies generics instead. Interviewers like this comparison.

Bridge methods: when a class implements `Comparable<Version>`, the compiler emits a synthetic `compareTo(Object)` that casts and delegates, so the erased interface method is still overridden. You see them only in stack traces and reflection.

## Raw types

A raw type is a generic type used without arguments: `List list = new ArrayList();`. It exists for legacy code and should never appear in new code. It disables checking for every method call on that reference, so `list.add("x")` into what was supposed to be a `List<Integer>` compiles and blows up at the read site. `List<?>` is the correct way to say "a list of something".

## Arrays and generics

```java
List<String>[] arr = new List<String>[3];   // compile error: generic array creation
List<String>[] ok = new List[3];            // compiles with an unchecked warning
```

Arrays check element types at runtime using the runtime class, which erasure has removed, so a generic array cannot be verified. Inside a generic class use `(T[]) new Object[n]` with `@SuppressWarnings("unchecked")` and never let the array escape, which is what `ArrayList` does. Varargs of a generic type (`T... xs`) create exactly this situation; `@SafeVarargs` is your promise that the method does not store into the array.

## Type inference and the diamond

- The diamond `<>` works with `new` and anonymous classes (since 9).
- Target typing: `List<String> xs = List.of();` infers `String` from the assignment; `var xs = List.of();` infers `List<Object>`.
- When inference fails you can supply a witness: `Collections.<String>emptyList()`.
- Lambdas are inferred from the functional interface they target, so `Comparator.comparing(p -> p.name())` sometimes needs `Comparator.comparing((Person p) -> p.name())` when chained with `.reversed()`, because the chain is resolved left to right and `p` is `Object` until the target type is known.

## Recursive bounds and self types

`<T extends Comparable<T>>` says "T can compare to its own type". Builders and fluent APIs use the same trick for `this`-returning methods in a hierarchy:

```java
abstract class Builder<B extends Builder<B>> {
    String name;
    @SuppressWarnings("unchecked")
    B name(String n) { name = n; return (B) this; }
}
final class UserBuilder extends Builder<UserBuilder> {
    UserBuilder email(String e) { return this; }
}
new UserBuilder().name("a").email("b");   // name() returns UserBuilder, so chaining works
```

## A generic interview snippet

Write a generic, bounded, PECS-correct method and explain each part:

```java
public static <T extends Comparable<? super T>> T maxOf(Collection<? extends T> items) {
    Iterator<? extends T> it = items.iterator();
    T best = it.next();
    while (it.hasNext()) {
        T next = it.next();
        if (next.compareTo(best) > 0) best = next;
    }
    return best;
}
```

`Comparable<? super T>` admits a type that inherits its comparison from a parent (`java.sql.Timestamp` implements `Comparable<Date>`, not `Comparable<Timestamp>`); `Collection<? extends T>` admits any collection of subtypes. Drop either wildcard and real call sites stop compiling. That is the signature of `Collections.max`.

## Common interview questions

**Why is `List<Integer>` not a `List<Number>`?**
Generic types are invariant. If the assignment were allowed, code holding the `List<Number>` view could add a `Double` and the `List<Integer>` would be corrupted with no runtime check. Use `List<? extends Number>` when you only read.

**Explain PECS.**
Producer extends, consumer super. A parameter you read from is declared `? extends T` so any subtype's collection works; a parameter you write to is declared `? super T` so any supertype's collection can accept your values. `Collections.copy(List<? super T> dest, List<? extends T> src)` shows both.

**What is type erasure and what does it cost you?**
The compiler checks generics and then erases them to bounds; the bytecode has only `List` and `Object` with inserted casts. You lose runtime type information: no `instanceof List<String>`, no `new T()`, no overloading on type arguments, and `ClassCastException` can surface far from the unchecked cast that caused it.

**Why can't you create a generic array?**
Array stores are checked at runtime against the array's element class, and erasure means there is no `List<String>` class to check against, so the JVM cannot keep arrays safe. `ArrayList` works around it with an `Object[]` and casts on read.

**What is a raw type and why is it bad?**
A generic type used without a type argument. It turns off generic checking for that reference, so wrong-typed inserts compile and fail at read time. It exists only for compatibility with pre-generics code.

**What is the difference between `List<?>` and `List<Object>`?**
`List<Object>` is a specific type that only a `List<Object>` can be assigned to. `List<?>` accepts any list, but you can only read `Object`s from it and cannot add anything. Use `List<?>` for "I don't care about the element type".

**How does Jackson deserialise a `List<User>` if generics are erased?**
You pass a `TypeReference<List<User>>() {}`, an anonymous subclass whose generic superclass signature is retained in the class file. Jackson reads it reflectively via `getGenericSuperclass()`. Erasure removes arguments from values, not from declarations.

**When would you write a generic method instead of a generic class?**
When only one operation is parameterised, or when the method is static (which cannot use a class type parameter). Utility methods like `Collections.sort` and `List.of` are the pattern.
