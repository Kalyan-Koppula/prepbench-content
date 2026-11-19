---
title: Inheritance, Polymorphism and Composition
order: 2
summary: Overriding versus overloading rules, super, dynamic dispatch, equals under inheritance, a concrete composition-over-inheritance refactor, and the Liskov questions.
---

"Overriding versus overloading" and "composition over inheritance" are asked in nearly every Java interview. The first is a rules question with traps; the second is a judgement question where interviewers want to see a refactor, not a slogan.

## Overriding versus overloading

| | Overriding | Overloading |
|---|---|---|
| Where | Subclass redefines an inherited instance method | Same class (or hierarchy) declares the same name with different parameters |
| Resolved | At runtime, by the object's class (dynamic dispatch) | At compile time, by the static types of the arguments |
| Signature | Same name and parameters; return type may be a subtype (covariant) | Same name, different parameter list; return type alone cannot differ |
| Access | Cannot be narrower than the parent's | Any |
| Exceptions | Cannot throw new or broader checked exceptions | Any |
| `static`/`private`/`final` methods | Not overridable (static is hidden, private is invisible, final is forbidden) | Fine |

```java
class Animal { Animal self() { return this; } void speak() { System.out.println("..."); } }
class Dog extends Animal {
    @Override Dog self() { return this; }                 // covariant return
    @Override void speak() { System.out.println("woof"); }
    void speak(String to) { System.out.println("woof, " + to); }   // overload, not override
}

Animal a = new Dog();
a.speak();          // woof   — dispatched on the runtime type
a.speak("you");     // compile error — the static type Animal has no speak(String)
```

Always write `@Override`. Without it, a typo (`equals(Dog d)` instead of `equals(Object o)`) silently becomes an overload.

### Overload resolution traps

```java
static void f(Object o) { System.out.println("Object"); }
static void f(String s) { System.out.println("String"); }
static void f(Integer i) { System.out.println("Integer"); }

f(null);            // compile error: String and Integer are both more specific than Object, neither beats the other
f("x");             // String
Object o = "x"; f(o);   // Object — static type decides
f(1);               // Integer (boxing)
```

Resolution phases: exact or widening primitive match first, then boxing/unboxing, then varargs. `f(long)` beats `f(Integer)` for an `int` argument because widening comes before boxing.

## `super`

- `super.method()` calls the parent's version; you cannot skip a level (`super.super` does not exist).
- `super(...)` must be the first statement in a constructor (until Java 25's flexible constructor bodies) and runs the parent's initialisation.
- `Interface.super.method()` picks a specific default method in a diamond.
- Fields are not polymorphic: `super.x` and `this.x` can be different fields if the subclass shadows `x`. Do not shadow fields.

## Dynamic dispatch

Every instance method call is a virtual call: the JVM looks up the method in the runtime class's vtable (or interface table). Final and private methods, and static methods, are bound statically and can be inlined without a type check. The JIT also devirtualises monomorphic call sites, so `interface` dispatch is not a real performance concern in application code; say that if asked about "interface overhead".

## `equals` under inheritance

The symmetry rule breaks as soon as a subclass adds state:

```java
class Point {
    final int x, y;
    Point(int x, int y) { this.x = x; this.y = y; }
    @Override public boolean equals(Object o) {
        return o instanceof Point p && p.x == x && p.y == y;
    }
    @Override public int hashCode() { return Objects.hash(x, y); }
}
class ColorPoint extends Point {
    final String color;
    ColorPoint(int x, int y, String c) { super(x, y); color = c; }
    @Override public boolean equals(Object o) {
        return o instanceof ColorPoint cp && super.equals(o) && cp.color.equals(color);
    }
}

Point p = new Point(1, 2);
ColorPoint cp = new ColorPoint(1, 2, "red");
p.equals(cp);   // true
cp.equals(p);   // false — symmetry violated
```

Options, in order of preference:

1. Make value classes `final` (or records), so there are no subclasses.
2. Use `getClass() == o.getClass()` instead of `instanceof`, which keeps symmetry but means a subclass that adds no state is still unequal to its parent, and breaks with proxies (Hibernate, Spring AOP subclass proxies).
3. Favour composition: `ColorPoint` holds a `Point` and is its own value type.

There is no `equals` that is symmetric, transitive and lets a subclass add a significant field. That is the sentence to say.

## Composition over inheritance: a refactor

Inheritance is the strongest coupling in the language: a subclass depends on its parent's implementation details and must remain valid under every future change to the parent. The canonical trap is extending a collection:

```java
// Before: counts insertions by extending HashSet
class CountingSet<E> extends HashSet<E> {
    private int added = 0;
    @Override public boolean add(E e) { added++; return super.add(e); }
    @Override public boolean addAll(Collection<? extends E> c) { added += c.size(); return super.addAll(c); }
    int added() { return added; }
}
new CountingSet<String>().addAll(List.of("a", "b", "c"));   // added == 6, because HashSet.addAll calls add
```

The bug depends on an undocumented detail of `HashSet` and can appear or vanish with a JDK upgrade. The fix is to wrap:

```java
// After: forward to a wrapped Set
class CountingSet<E> implements Set<E> {
    private final Set<E> inner;
    private int added = 0;
    CountingSet(Set<E> inner) { this.inner = inner; }

    @Override public boolean add(E e) { added++; return inner.add(e); }
    @Override public boolean addAll(Collection<? extends E> c) {
        boolean changed = false;
        for (E e : c) changed |= add(e);
        return changed;
    }
    int added() { return added; }
    // remaining Set methods forward to inner: size, contains, remove, iterator, ...
}
```

Now the count is exactly the number of `add` calls on this object, the wrapper works with any `Set` implementation, and `HashSet` can change freely. The forwarding boilerplate is the price; Lombok's `@Delegate` or an IDE generates it.

When inheritance is still right: a genuine is-a relation where the subclass must be substitutable everywhere, the superclass is designed for extension (documented hooks, no self-calls to overridable methods from constructors), and both are under your control. Frameworks (`AbstractList`, template bases) are the typical case. Everything else is composition plus an interface.

## Liskov substitution

A subtype must be usable wherever its supertype is expected without the caller knowing. The questions interviewers ask:

- **Square extends Rectangle?** No. `setWidth` on a square must also change the height, so code that sets width then height on a `Rectangle` breaks. Immutable shapes with a shared `Shape` interface sidestep it.
- **Can an override throw more?** Not checked exceptions, and by LSP not unexpected unchecked ones either. `UnsupportedOperationException` from `Collections.unmodifiableList().add` is the famous JDK violation, excused by documentation.
- **Can an override strengthen preconditions?** No (reject fewer inputs, never more). Postconditions may be strengthened (promise more).
- **Return types?** Covariant returns are allowed precisely because returning a more specific type never breaks a caller.

The practical test: if you find yourself writing `if (x instanceof SubType)` in code that takes the supertype, substitutability is already broken.

## Casting and `instanceof`

```java
Object o = "text";
String s = (String) o;             // checked at runtime; ClassCastException if wrong
if (o instanceof String str) { }   // pattern: test and bind in one step
```

Upcasts are implicit and always safe. Downcasts compile when the types are related and are checked at runtime. A cast between unrelated classes is a compile error; a cast to an interface compiles for any non-final class because a subclass might implement it.

## Worked example: the fragile base class

```java
public class CountingSet<E> extends HashSet<E> {
    private int addCount = 0;

    @Override
    public boolean add(E e) {
        addCount++;
        return super.add(e);
    }

    @Override
    public boolean addAll(Collection<? extends E> c) {
        addCount += c.size();
        return super.addAll(c);
    }

    public int addCount() { return addCount; }
}

CountingSet<String> set = new CountingSet<>();
set.addAll(List.of("a", "b", "c"));
set.addCount(); // 6, not 3
```

`HashSet.addAll` happens to call `add` for each element, so every element is counted twice. The subclass depended on an **implementation detail** of its parent, which could change in any release. That is the fragile base class problem.

The composition version wraps a set instead of extending one:

```java
public class CountingSet<E> implements Set<E> {
    private final Set<E> inner;
    private int addCount = 0;

    public CountingSet(Set<E> inner) { this.inner = inner; }

    @Override
    public boolean add(E e) {
        addCount++;
        return inner.add(e);
    }

    @Override
    public boolean addAll(Collection<? extends E> c) {
        addCount += c.size();
        return inner.addAll(c); // calls inner.add, not ours: no double counting
    }

    public int addCount() { return addCount; }

    // remaining Set methods simply delegate to inner
    @Override public int size() { return inner.size(); }
    @Override public boolean contains(Object o) { return inner.contains(o); }
    // ...
}
```

It works with any `Set` implementation, and it can't be broken by changes inside `HashSet`. The cost is writing delegating methods (or extending a forwarding base class written once).

## When inheritance is the right tool

- A genuine "is-a" relationship where the subclass honours the whole contract (Liskov).
- The base class is **designed for extension**: documented hooks (template method), `protected` extension points, and a statement of which methods call which.
- Framework extension points meant for subclassing (`AbstractList`, Spring's `OncePerRequestFilter`).

Otherwise, prefer composition and interfaces. Mark classes `final` unless you've designed them for inheritance; sealed classes are the middle ground, allowing a known set of subclasses.

## Common interview questions

**What is the difference between overriding and overloading?**
Overriding replaces an inherited instance method with the same signature and is chosen at runtime by the object's class. Overloading declares several methods with the same name and different parameters, chosen at compile time by the argument types. `@Override` protects you from accidentally doing the second when you meant the first.

**Why does `a.speak("you")` fail when `a` is declared as `Animal` but holds a `Dog`?**
Method lookup for compile-time existence uses the static type `Animal`, which has no `speak(String)`. Dynamic dispatch only selects among overrides of a method the static type already has.

**What happens if you call `f(null)` with overloads for `String` and `Integer`?**
A compile error: both are applicable and neither is more specific than the other. With overloads for `Object` and `String` it picks `String`, the most specific applicable one.

**Why is composition preferred over inheritance?**
Inheritance couples the subclass to the parent's implementation, exposes every parent method whether or not it makes sense, and breaks when the parent changes self-call patterns, as in the `HashSet.addAll` example. Composition exposes only the interface you choose, swaps implementations at runtime, and is testable with a fake inner object.

**When is inheritance the right choice?**
When the relationship is truly is-a and substitutable, the base class is designed and documented for extension, and you own both sides. Template-method bases and framework hooks are the usual cases.

**Why can't `equals` work properly with inheritance?**
`instanceof`-based equality breaks symmetry when a subclass adds fields; `getClass`-based equality keeps symmetry but makes a trivial subclass unequal to its parent and breaks proxies. The clean fix is to make value classes `final` or use records, and to model variations with composition.

**Explain Liskov substitution with an example.**
A subtype must honour the supertype's contract so callers never need to know which one they have. `Square extends Rectangle` fails because setting the width of a square must change its height, so code written against `Rectangle` observes a broken invariant. The fix is immutable shapes or a common interface without setters.

**Is Java's method call always virtual?**
Instance methods are virtual unless `private`, `final` or `static`. The JIT removes most of the cost by inlining monomorphic call sites, so the overhead is not a reason to avoid interfaces.

## Pitfalls

- Inheriting to reuse code when there's no is-a relationship.
- Calling overridable methods from constructors (the subclass method runs before its fields are initialised).
- Overloading when you meant overriding (a different parameter type): use `@Override` always.
- Breaking `equals` symmetry by mixing `instanceof` checks across a hierarchy.
- Deep hierarchies that make behaviour hard to trace.

## Key takeaways

- Overriding is chosen at runtime by the object's class; overloading at compile time by argument types.
- Liskov: a subtype must be usable anywhere its supertype is expected, without surprises.
- Inheritance couples you to the parent's implementation; composition couples you only to its interface.
- Prefer composition and interfaces; reserve inheritance for classes designed for it.
- Use `@Override`, `final` and sealed types to make intent explicit.
