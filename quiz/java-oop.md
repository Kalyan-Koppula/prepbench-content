---
title: OOP and Design
order: 2
module: java-oop
summary: Initialisation order, interfaces vs abstract classes, overriding rules, equals under inheritance, immutability, SOLID, singletons and comparators.
---

## In what order does a subclass get initialised?

Static initialisers of the superclass then the subclass, once per class on first use. Then superclass field initialisers and instance blocks, the superclass constructor body, subclass field initialisers and blocks, and finally the subclass constructor body.

## Why is calling an overridable method from a constructor dangerous?

The subclass override runs before the subclass constructor has initialised its fields, so it sees defaults like `null` and `0`, even for `final` fields. Make methods called from constructors private or final, or move the work to a factory.

## What does `protected` actually grant?

Access from subclasses in any package, and also from every class in the same package. The second half is what people forget. Package-private is the default when no modifier is written.

## Abstract class or interface — how do you choose?

Interface by default: it defines a capability and allows multiple implementation. Choose an abstract class when implementations share state, need a constructor to enforce invariants, or follow a template method with non-public hooks. Often you use both: interface for the type, abstract base for shared code.

## Why were default methods added to interfaces, and what problem do they introduce?

So an interface can gain methods without breaking existing implementors, which is how `stream()` was added to `Collection`. They introduce the diamond: a class inheriting the same default from two interfaces must override it, and a superclass method silently beats an interface default.

## What is the difference between a static nested class and an inner class?

A static nested class is a namespaced top-level class with no link to an outer instance. An inner class captures `Outer.this`, which costs a reference, can leak the outer object, and requires an outer instance to construct. Default to static.

## Can you override a static method?

No. Declaring the same static signature in a subclass hides the parent method; the one called is chosen by the compile-time type of the reference. Dynamic dispatch applies only to instance methods.

## What is the difference between overriding and overloading?

Overriding replaces an inherited instance method with the same signature and is resolved at runtime by the object's class. Overloading declares several methods with the same name and different parameter lists, resolved at compile time from the argument types. `@Override` guards against doing the second by accident.

## What happens with `f(null)` when overloads `f(String)` and `f(Integer)` exist?

A compile error: both are applicable and neither is more specific than the other. With `f(Object)` and `f(String)` the compiler picks `f(String)` as the most specific applicable overload.

## What rules must an overriding method follow?

Same name and parameters, a return type that is the same or a subtype, access no more restrictive than the parent, and no new or broader checked exceptions. `private`, `static` and `final` methods cannot be overridden.

## Why can't `equals` be made both symmetric and extensible?

If a subclass adds a field and uses `instanceof`, `parent.equals(child)` can be true while `child.equals(parent)` is false. Using `getClass()` restores symmetry but makes even a trivial subclass unequal and breaks proxies. The fix is `final` value classes or records and composition for variants.

## Why prefer composition over inheritance?

Inheritance couples you to the parent's implementation and exposes every parent method. `class CountingSet extends HashSet` double-counts in `addAll` because `HashSet.addAll` calls `add` internally. Wrapping a `Set` and forwarding counts exactly what you call and works with any implementation.

## When is inheritance still the right tool?

When the relationship is genuinely is-a and the subtype is substitutable everywhere, the base class is designed and documented for extension, and you control both sides. Template-method base classes and framework hooks are the usual cases.

## Explain the Liskov substitution principle with `Square` and `Rectangle`.

A subtype must honour the supertype's contract. If `Square extends Rectangle`, setting the width must also change the height, so code that sets width then height on a `Rectangle` observes a broken invariant. Immutable shapes behind a common interface avoid the problem.

## How do you make a class immutable?

Make it `final`, all fields `private final`, no setters, defensively copy mutable constructor arguments, never expose internal arrays or collections, and do not let `this` escape the constructor. Or use a record and `List.copyOf` any collection components in the compact constructor.

## Is a record automatically immutable?

Only shallowly. Its fields are final, but a `List` or array component can still be mutated by anyone holding a reference. Normalise with `List.copyOf` in the compact constructor and keep component types themselves immutable.

## What is the difference between `Collections.unmodifiableList` and `List.copyOf`?

`unmodifiableList` returns a read-only view; changes to the underlying list still show through. `List.copyOf` makes an independent snapshot that rejects nulls. Both throw on mutation; only the copy is genuinely immutable.

## Why does immutability help with concurrency?

There is no state to race on, and the memory model guarantees that `final` fields are visible to any thread that sees the object after construction. Immutable values can be shared freely, and swapping a reference to a new snapshot is a lock-free update strategy.

## What is a value object?

An object defined by its value rather than an identity: two instances with equal fields are interchangeable. It is immutable and implements `equals` and `hashCode` over all fields. `Money` and `Email` are value objects; an `Order` with an id is an entity.

## What is the single responsibility principle, really?

A class should have one reason to change, meaning one stakeholder or axis of change, not one method. A service that persists, renders and emails an invoice has three; splitting it lets each change and be tested independently.

## How do dependency inversion and dependency injection differ?

DIP is about ownership of the abstraction: the high-level module declares the interface and infrastructure implements it, so dependency arrows point inward. DI is the runtime mechanism that supplies implementations, which Spring automates. You can inject concrete classes and still violate DIP.

## When is the open/closed principle the wrong choice?

When the set of variants is a fixed domain concept. A `switch` over a sealed type is deliberately closed so the compiler forces every case to be handled. Reach for strategies when variants are expected to be added from outside.

## Why does double-checked locking need `volatile`?

Without it the JIT or CPU can publish the reference before the object's field writes are visible, so another thread passes the first null check and uses a half-constructed instance. `volatile` forbids that reordering. The static holder idiom gets lazy, thread-safe initialisation without any of this.

## What is the simplest correct singleton in Java?

A single-element enum. Class initialisation makes it thread-safe, and it is immune to reflection and serialisation creating a second instance. In Spring you would just use a singleton-scoped bean instead of static access.

## When is a builder worth it?

When a type has more than about four parameters, many are optional, or validation spans several fields. The builder gives named steps, defaults and a validated immutable result. For a small, all-required type a record is better; Lombok's `@Builder` generates the same shape.

## Strategy versus template method?

Both vary one step of an algorithm. Strategy passes the varying part in as an object, swappable at runtime and testable alone. Template method has subclasses override hooks, which couples them to the base. Prefer strategy unless several hooks share state.

## How does the decorator pattern show up in Java?

I/O streams wrap each other to add buffering or decoding, and Spring's proxies decorate beans with transactions, caching and retries. The pattern adds behaviour behind the same interface without subclassing, and wrappers compose in any order.

## Why not `return a.x - b.x` in a comparator?

Subtraction overflows when the operands have opposite signs and large magnitude, flipping the sign of the result. `Integer.compare(a.x, b.x)` is correct across the full range.

## What does "consistent with equals" mean for a comparator?

`compare` returns zero exactly when `equals` is true. `TreeSet` and `TreeMap` use only the comparator to decide duplicates and lookups, so an inconsistent one makes a sorted set and a hash set disagree about membership, as `BigDecimal` `2.0` versus `2.00` shows.

## Why does `Comparator.comparing(p -> p.name()).reversed()` not compile?

Target typing only reaches the first call in the chain; `reversed()` is resolved on the result of `comparing`, so the lambda parameter is inferred as `Object` and has no `name()`. Use a method reference or an explicitly typed lambda parameter.
