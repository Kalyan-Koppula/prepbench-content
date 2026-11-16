---
title: Classes, Interfaces and Abstract Classes
order: 1
summary: Access modifiers, constructors and initialisation order, static and final, the four kinds of nested class, interface default/static/private methods, and the abstract-class-versus-interface decision.
---

Java's class system is small but the rules are precise, and interviewers ask about the precise bits: initialisation order, what `static` really means, when a nested class leaks its outer instance, and the abstract-class-versus-interface question that every Java interview contains.

## Access modifiers

| Modifier | Same class | Same package | Subclass (other package) | Everyone |
|---|---|---|---|---|
| `private` | yes | | | |
| (none, "package-private") | yes | yes | | |
| `protected` | yes | yes | yes | |
| `public` | yes | yes | yes | yes |

- Top-level classes can only be `public` or package-private.
- `protected` includes package access, which surprises people: a `protected` member is visible to any class in the same package, not just subclasses.
- `private` is per class, not per instance: `other.secret` compiles inside the same class, which is how `equals` reads the other object's fields.
- Default to the narrowest modifier. Package-private classes with a `public` interface are the standard way to hide implementations without modules.

## Constructors and initialisation order

```java
class Base {
    static { System.out.println("1 Base static"); }
    { System.out.println("3 Base instance block"); }
    Base() { System.out.println("4 Base ctor"); init(); }
    void init() {}
}
class Derived extends Base {
    static { System.out.println("2 Derived static"); }
    private final Instant created = Instant.now();
    { System.out.println("5 Derived instance block"); }
    Derived() { super(); System.out.println("6 Derived ctor"); }
    @Override void init() { System.out.println("created=" + created); }   // prints created=null
}
```

Order for `new Derived()`: static initialisers once per class, superclass first; then for each level from the top, field initialisers and instance blocks in source order, then the constructor body. The implicit `super()` call is the first statement, which is why calling an overridable method from a constructor sees uninitialised subclass fields (`created=null` above, even though `created` is `final`). Until Java 25, no statement may precede `super(...)`/`this(...)`. (A `final` field initialised with a string or numeric literal is a compile-time constant and gets inlined, which is why the example uses `Instant.now()`.)

- No constructor declared: the compiler adds a public no-arg one. Declare any constructor and the default disappears, which breaks frameworks that need a no-arg constructor (JPA, Jackson without `@JsonCreator`).
- `this(...)` delegates to another constructor; put validation in the most complete one.
- Prefer static factory methods (`Money.of(...)`, `List.of`) when you want a name, caching, a subtype return, or a non-public constructor.

## `static`

`static` members belong to the class. There is one copy regardless of how many instances exist, and they are initialised when the class is first used, not when the program starts.

- Static methods cannot use `this` or be overridden; a subclass defining the same signature hides the parent's method, resolved by the static type.
- `static` nested classes and constants are the normal uses. Mutable static state is a shared-global smell and a concurrency hazard.
- Lazy class initialisation is thread-safe by JVM guarantee, which is what the initialisation-on-demand holder singleton relies on.
- Static imports for constants and utilities (`import static java.util.Objects.requireNonNull`), not for everything.

## `final`

| On | Means |
|---|---|
| Variable | Assigned exactly once; for a reference, the object may still be mutable |
| Field | Must be assigned in every constructor (or initialiser); JMM guarantees safe publication of final fields |
| Method | Cannot be overridden |
| Class | Cannot be subclassed (`String`, `Integer`, all records and enums) |
| Parameter | Cannot be reassigned in the method body |

`final` on a field is what makes immutable classes thread-safe without synchronisation. `final` on a class also closes the `equals` symmetry problem with subclasses.

## Nested classes

| Kind | Declared | Holds outer `this`? | Use |
|---|---|---|---|
| Static nested | `static class Node` inside `LinkedList` | No | Helper types that belong to the outer class; the default choice |
| Inner (non-static) | `class Iter` inside `MyList` | Yes, implicitly | Iterators and views that need the outer instance |
| Local | Inside a method body | Yes if in an instance method | Rare; records in a method are the modern use |
| Anonymous | `new Comparator<>() { ... }` | Yes if in an instance method | Pre-lambda callbacks; still needed for abstract classes or multi-method interfaces |

```java
public class Graph {
    private final Map<Integer, List<Integer>> adj = new HashMap<>();

    public static final class Edge {                 // static: no hidden Graph reference
        public final int from, to;
        Edge(int from, int to) { this.from = from; this.to = to; }
    }

    public class NeighbourView implements Iterable<Integer> {   // inner: reads Graph.this.adj
        private final int node;
        NeighbourView(int node) { this.node = node; }
        public Iterator<Integer> iterator() { return adj.getOrDefault(node, List.of()).iterator(); }
    }
}
```

Inner classes hold an implicit `Outer.this` reference. That is the classic memory-leak source (an inner listener keeps a huge outer object alive) and why Sonar flags "could be static". Instantiate from outside with `graph.new NeighbourView(3)`, which you will almost never write.

## Interfaces

An interface declares a contract. Fields are implicitly `public static final`; methods are implicitly `public abstract` unless `default`, `static` or `private`.

```java
public interface Cache<K, V> {
    V get(K key);
    void put(K key, V value);

    default V getOrCompute(K key, Function<K, V> f) {     // Java 8: evolvable API with a body
        V v = get(key);
        if (v == null) { v = f.apply(key); put(key, v); }
        return v;
    }

    static <K, V> Cache<K, V> noop() {                     // Java 8: factory on the interface
        return new Cache<>() {
            public V get(K k) { return null; }
            public void put(K k, V v) {}
        };
    }

    private void log(String msg) { }                       // Java 9: shared helper for defaults
}
```

- Default methods exist so an interface can gain methods without breaking implementors (`Collection.stream()` was added this way).
- Diamond rule: a class inheriting the same default method from two interfaces must override it and may pick one with `A.super.m()`. A superclass method always wins over an interface default.
- Interfaces cannot have instance state or constructors. If you want shared state, you want an abstract class.
- Marker interfaces (`Serializable`, `Cloneable`) have no methods; annotations are the modern alternative.
- `sealed interface` restricts implementors; see the records and sealed types article.

## Abstract classes

An abstract class may have constructors, fields, concrete methods and abstract methods, and cannot be instantiated. Use it for a partial implementation that subclasses complete, which is the template method pattern.

```java
public abstract class Report {
    private final Clock clock;
    protected Report(Clock clock) { this.clock = clock; }

    public final String render() {                      // the fixed algorithm
        return header() + body() + "\nGenerated " + Instant.now(clock);
    }
    protected String header() { return "# Report\n"; }  // optional hook
    protected abstract String body();                   // required step
}
```

## Abstract class versus interface

| Question | Abstract class | Interface |
|---|---|---|
| Can a type have more than one? | No, single inheritance | Yes |
| Shared state (fields)? | Yes | Only constants |
| Constructors, invariants enforced at creation? | Yes | No |
| Methods with bodies? | Yes | `default`/`static`/`private` only |
| Access modifiers on members | Any | `public` (or `private` helper) |
| Models | "is a kind of", shared skeleton | "can do", capability |

Rule of thumb: define types with interfaces; share implementation with an abstract class that implements the interface (`List` → `AbstractList` → `ArrayList`). Since default methods exist, the only hard reasons for an abstract class are state, constructors and non-public members. In an interview, lead with "interface for the contract; abstract class only when I need shared state or a template method".

## Object methods every class inherits

`equals`, `hashCode`, `toString`, `getClass`, `clone` (protected, avoid), `finalize` (deprecated for removal; use `Cleaner`), `wait`/`notify`/`notifyAll` (monitor methods, see concurrency). Override `toString` on anything you log; records do it for you.

## Common interview questions

**What is the order of initialisation when you construct a subclass?**
Static initialisers of the superclass then subclass, once per class on first use. Then superclass field initialisers and instance blocks, superclass constructor body, subclass field initialisers and blocks, subclass constructor body. Calling an overridable method from a superclass constructor runs the override before the subclass fields are set.

**Abstract class or interface?**
Interface by default: it defines a capability and permits multiple implementation. Abstract class when implementations share state, need a constructor to enforce invariants, or follow a template method with non-public hooks. Often both: interface for the type, abstract base for convenience.

**What problem do default methods solve and what new problem do they create?**
They let an interface evolve without breaking every implementor, which is how streams were added to `Collection`. They create the diamond: inheriting the same default from two interfaces forces an explicit override, and a superclass method silently wins over a default.

**Static nested class versus inner class?**
A static nested class is just a namespaced top-level class. An inner class captures the enclosing instance, which costs a reference, can leak the outer object, and means it cannot be created without one. Default to static; go inner only when the class genuinely needs the outer instance, like an iterator.

**Can you override a static method?**
No. A subclass can declare a static method with the same signature, but that hides rather than overrides: the method called is chosen by the compile-time type of the reference, not the runtime object. Dynamic dispatch applies to instance methods only.

**What does `protected` actually grant?**
Access from subclasses in any package, plus access from every class in the same package. People forget the second part. It is also the usual visibility for template-method hooks.

**Why prefer static factory methods over constructors?**
They have names (`of`, `from`, `valueOf`), can return cached instances or a subtype, can hide the implementing class behind an interface, and make it possible to make the constructor private. The cost is that they are not visually distinct from other static methods, which naming conventions address.

**Why is calling an overridable method from a constructor a bug?**
The subclass's override runs before the subclass constructor has initialised its fields, so it observes defaults (`null`, `0`) even for `final` fields. Make the methods called from constructors `private` or `final`, or move the work to a factory method.
