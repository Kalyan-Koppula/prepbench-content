---
title: Prototypes and Classes
order: 4
summary: The prototype chain, what new actually does, Object.create, class syntax as sugar, private fields and inheritance gotchas.
---

JavaScript doesn't copy behaviour from classes into objects the way Java or C++ do. Every object has a hidden link to another object, its **prototype**, and property lookups that fail on the object continue along that link. `class` syntax, added in 2015, is a cleaner way to set up those links; it doesn't replace them. Interviewers ask about prototypes to see whether you know what `class`, `new` and `extends` actually do underneath.

## Why prototypes

Imagine a thousand user objects that all need a `describe` method. Copying the function onto each object wastes memory and makes it impossible to change the behaviour for all of them at once. Instead, put the method on one shared object and let each user **delegate** to it:

```js
const userMethods = {
  describe() {
    return `${this.name} (${this.role})`
  },
}

const ana = Object.create(userMethods)
ana.name = 'Ana'
ana.role = 'admin'

ana.describe() // 'Ana (admin)'
Object.getPrototypeOf(ana) === userMethods // true
```

`ana` doesn't have a `describe` property. The lookup fails on `ana`, follows the prototype link to `userMethods`, finds it there, and calls it with `this` set to `ana` (see [How this Is Bound](/read/this-binding)). Data lives on the object; shared behaviour lives on the prototype.

## The prototype chain

Every object has an internal slot, written `[[Prototype]]` in the specification, that points to another object or to `null`. Reading a property walks this chain:

1. Look for an own property on the object.
2. If not found, look on its prototype.
3. Repeat until found or the chain ends at `null`, which gives `undefined`.

```js
const animal = {
  breathes: true,
}
const dog = Object.create(animal)
dog.barks = true
const puppy = Object.create(dog)
puppy.small = true

puppy.small // true (own)
puppy.barks // true (from dog)
puppy.breathes // true (from animal)
puppy.flies // undefined (not found anywhere)
```

```
puppy ──[[Prototype]]──▶ dog ──▶ animal ──▶ Object.prototype ──▶ null
 small                   barks    breathes   toString, hasOwnProperty, …
```

Every plain object ends at `Object.prototype`, which is why every object has `toString` and `hasOwnProperty`. Arrays go `arr → Array.prototype → Object.prototype → null`; functions go `fn → Function.prototype → Object.prototype → null`.

### Reading versus writing

Lookups walk the chain; **assignments don't**. Writing `puppy.breathes = false` creates an own property on `puppy` that **shadows** the one on `animal`. `animal` is untouched.

```js
puppy.breathes = false
puppy.breathes // false (own property)
dog.breathes // true (still from animal)
```

There are two exceptions. If the inherited property is a **setter**, the assignment calls the setter instead of creating an own property. If the inherited property is **non-writable**, the assignment silently fails (or throws in strict mode).

### Inspecting the chain

| Tool | What it tells you |
| --- | --- |
| `Object.getPrototypeOf(obj)` | The prototype of `obj` |
| `Object.setPrototypeOf(obj, proto)` | Changes it (slow; avoid on hot objects) |
| `Object.create(proto)` | A new object with `proto` as its prototype |
| `Object.hasOwn(obj, key)` | Whether `key` is an own property (preferred over `obj.hasOwnProperty`) |
| `key in obj` | Whether `key` exists anywhere on the chain |
| `proto.isPrototypeOf(obj)` | Whether `proto` is anywhere in `obj`'s chain |
| `obj instanceof Fn` | Whether `Fn.prototype` is anywhere in `obj`'s chain |
| `obj.__proto__` | Legacy accessor for the prototype; avoid in new code |

`for...in` loops over enumerable properties **including inherited ones**; `Object.keys` only returns own enumerable properties. That difference is a classic bug source.

## Two different "prototype"s

The most confusing part of the topic is that the word means two things:

- **`[[Prototype]]`** (read with `Object.getPrototypeOf`): every object's link to the next object in its chain.
- **`Fn.prototype`**: an ordinary property that every regular function has. It is **not** the function's own prototype. It is the object that will become the `[[Prototype]]` of instances created with `new Fn()`.

```js
function Person(name) {
  this.name = name
}
Person.prototype.greet = function () {
  return `hi, ${this.name}`
}

const p = new Person('Cy')

Object.getPrototypeOf(p) === Person.prototype // true: instances link to Fn.prototype
Object.getPrototypeOf(Person) === Function.prototype // true: the function's own prototype
Person.prototype.constructor === Person // true: a back-reference set up automatically
```

## What `new` does

`new Person('Cy')` performs four steps:

1. Create an empty object.
2. Set its `[[Prototype]]` to `Person.prototype`.
3. Call `Person` with `this` bound to the new object.
4. Return the new object, unless `Person` returned an object of its own.

A hand-written version makes this concrete:

```js
function myNew(Constructor, ...args) {
  const obj = Object.create(Constructor.prototype) // steps 1 and 2
  const result = Constructor.apply(obj, args) // step 3
  if (result !== null && (typeof result === 'object' || typeof result === 'function')) {
    return result // step 4: an explicit object return wins
  }
  return obj
}

const q = myNew(Person, 'Dee')
q.greet() // 'hi, Dee'
```

## `instanceof`

`obj instanceof Fn` walks `obj`'s prototype chain and checks whether `Fn.prototype` appears anywhere in it. It doesn't check how the object was created.

```js
function myInstanceOf(obj, Fn) {
  let proto = Object.getPrototypeOf(obj)
  while (proto !== null) {
    if (proto === Fn.prototype) {
      return true
    }
    proto = Object.getPrototypeOf(proto)
  }
  return false
}
```

Consequences worth knowing:

- Changing `Fn.prototype` after creating instances breaks `instanceof` for those instances.
- Objects from another realm (an iframe, a worker) fail `instanceof Array` because they have a different `Array.prototype`. Use `Array.isArray` instead.
- Classes can customise the check with a static `Symbol.hasInstance` method.

## Inheritance before classes

Setting up a subclass by hand needs three things: call the parent constructor for the instance fields, link the prototypes, and fix `constructor`.

```js
function Animal(name) {
  this.name = name
}
Animal.prototype.speak = function () {
  return `${this.name} makes a sound`
}

function Dog(name, breed) {
  Animal.call(this, name) // 1. parent's instance fields on this object
  this.breed = breed
}
Dog.prototype = Object.create(Animal.prototype) // 2. link Dog.prototype → Animal.prototype
Dog.prototype.constructor = Dog // 3. restore the back-reference
Dog.prototype.speak = function () {
  return `${Animal.prototype.speak.call(this)} (woof)` // calling the parent method
}

const rex = new Dog('Rex', 'collie')
rex.speak() // 'Rex makes a sound (woof)'
rex instanceof Animal // true
```

A common old mistake was `Dog.prototype = new Animal()`, which ran the parent constructor once with no arguments and put its instance fields on the shared prototype.

## Classes: the same thing, better syntax

```js
class Animal {
  constructor(name) {
    this.name = name
  }

  speak() {
    return `${this.name} makes a sound`
  }

  static create(name) {
    return new this(name)
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name) // must run before `this` is used
    this.breed = breed
  }

  speak() {
    return `${super.speak()} (woof)`
  }
}

typeof Animal // 'function'
Object.getPrototypeOf(Dog.prototype) === Animal.prototype // true
Object.getPrototypeOf(Dog) === Animal // true: static members are inherited too
```

The class produces the same structure as the manual version, with a few real differences:

| Class behaviour | Function constructor behaviour |
| --- | --- |
| Calling without `new` throws a TypeError | Runs with `this` as `undefined` or the global object |
| Class body is always strict mode | Strict only if declared |
| Methods are non-enumerable | Assigned methods are enumerable |
| Declarations are in the TDZ until evaluated (not hoisted for use) | Function declarations are fully hoisted |
| `super` works in methods | Must call the parent through its prototype manually |
| Static members are inherited (`Dog.create` works) | Must be copied or linked by hand |

### Why `super()` must come first

In a derived class, the **parent** constructor creates the object. Until `super()` returns, there is no `this` to use, so accessing it throws a ReferenceError. This also lets built-ins such as `Array` and `Error` be subclassed correctly: the object is created by the built-in constructor, with its special internal behaviour.

```js
class ValidationError extends Error {
  constructor(field, message) {
    super(message)
    this.name = 'ValidationError'
    this.field = field
  }
}

const err = new ValidationError('email', 'Email is required')
err instanceof Error // true
err.stack // includes the call stack, set up by Error
```

### Fields, private members and static blocks

```js
class Account {
  static #count = 0 // private static field
  #balance = 0 // private instance field, per object
  owner // public field, initialised to undefined

  static {
    // static initialisation block: runs once when the class is defined
  }

  constructor(owner) {
    this.owner = owner
    Account.#count += 1
  }

  deposit(amount) {
    if (amount <= 0) {
      throw new RangeError('amount must be positive')
    }
    this.#balance += amount
  }

  get balance() {
    return this.#balance
  }

  static get count() {
    return Account.#count
  }

  static isAccount(value) {
    return #balance in value // brand check: true only for real Account instances
  }
}
```

Points interviewers like:

- **Fields are per instance**, created before the constructor body runs (in a base class) or right after `super()` returns (in a derived class). They are not on the prototype.
- **`#private` names are truly private.** They can't be read with bracket access, `Object.keys` or a proxy; accessing one on the wrong object throws. Before they existed, privacy meant closures, `WeakMap`s or an underscore convention.
- **Arrow function fields** (`handle = () => {}`) bind `this` to the instance but create one function per instance and aren't on the prototype.

## Composition over deep hierarchies

Deep inheritance chains are brittle: a change in a base class ripples through every subclass. JavaScript makes composition easy, because objects can delegate to or contain other objects freely.

```js
function withTimestamps(Base) {
  return class extends Base {
    touch() {
      this.updatedAt = Date.now()
    }
  }
}

class Model {}
class Post extends withTimestamps(Model) {}
new Post().touch()
```

That "mixin" pattern composes behaviours without a deep tree. In practice, many codebases prefer plain functions and objects over classes entirely, using classes mainly for errors, custom elements and stateful services.

## Performance notes

- Engines optimise objects that keep the same **shape**: the same properties, added in the same order. Initialise all fields in the constructor (or with class fields) instead of adding them later.
- Long prototype chains make missed lookups slower; engines cache lookups, so this rarely matters in practice.
- `Object.setPrototypeOf` on an existing object invalidates those optimisations. Use `Object.create` when creating the object instead.
- Methods on the prototype are shared; arrow fields are duplicated per instance. With thousands of instances, that difference is measurable.

## Interview questions

**What is the prototype chain?**
Each object links to a prototype object. A property lookup that fails on the object continues along those links until it finds the property or reaches `null`. Assignments create own properties instead of walking the chain.

**What's the difference between `__proto__` and `prototype`?**
`__proto__` (or `Object.getPrototypeOf`) is an object's own link in its chain. `prototype` is a property on functions: the object that instances created with `new` will link to.

**What does `new` do?**
Creates an object linked to `Fn.prototype`, calls `Fn` with `this` set to it, and returns it unless `Fn` returns an object.

**Are classes just syntactic sugar?**
Mostly: they create a constructor function and a prototype object, like the manual pattern. But they add real behaviour: they throw without `new`, are always strict, make methods non-enumerable, support `super`, private fields and static inheritance, and let built-ins be subclassed properly.

**How does `instanceof` work?**
It checks whether `Fn.prototype` appears in the object's prototype chain. It fails across realms, so use `Array.isArray` for arrays.

**How would you implement inheritance without classes?**
Call the parent constructor with `Parent.call(this, …)`, set `Child.prototype = Object.create(Parent.prototype)`, and restore `Child.prototype.constructor`.

**What is `Object.create(null)` used for?**
An object with no prototype: no inherited `toString` or `constructor` keys, so it is a safe dictionary. A `Map` is usually a better choice today.

## Pitfalls

- Expecting assignment to change a prototype's property; it shadows it instead.
- `for...in` picking up inherited enumerable properties; use `Object.keys` or `Object.hasOwn`.
- Putting mutable arrays or objects on the prototype, where all instances share them.
- Using `this` before `super()` in a derived constructor.
- Detaching class methods and losing `this`.
- Relying on `instanceof` across iframes or workers.

## Key takeaways

- Objects delegate failed lookups to their prototype; that chain is JavaScript's inheritance.
- `Fn.prototype` is what instances link to; `Object.getPrototypeOf` reads the actual link.
- `new` = create, link, call with `this`, return.
- `class` builds the same structure with safer defaults, `super`, private fields and proper subclassing of built-ins.
- Prefer composition and shallow hierarchies; keep object shapes stable for performance.
