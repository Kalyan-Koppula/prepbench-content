---
title: Prototypes and Classes
order: 4
summary: The prototype chain, what new actually does, Object.create, class syntax as sugar, private fields and inheritance gotchas.
---

JavaScript objects inherit from other objects through a prototype chain. `class` is mostly a cleaner syntax over the same mechanism, with a few real differences. Interviewers ask you to explain property lookup, implement `new` or `instanceof`, and spot inheritance bugs.

## The prototype chain

Every object has an internal `[[Prototype]]` link (read with `Object.getPrototypeOf`, historically `__proto__`). Property reads walk the chain until found or until `null`.

```js
const animal = { eats: true, describe() { return `eats: ${this.eats}` } }
const dog = Object.create(animal)
dog.barks = true

dog.barks              // true — own property
dog.eats               // true — found on animal
dog.describe()         // 'eats: true' — `this` is dog, the receiver
Object.getPrototypeOf(dog) === animal // true
dog.toString === Object.prototype.toString // true — end of the chain
```

- **Reads** walk the chain. **Writes** create or update an own property on the receiver (unless the chain has a setter or a non-writable property with that name).
- `Object.hasOwn(obj, key)` checks own properties only; `key in obj` checks the whole chain.
- `for...in` iterates enumerable properties including inherited ones; `Object.keys` is own-enumerable only.

## `prototype` vs `[[Prototype]]`

| Thing | What it is |
|---|---|
| `Fn.prototype` | A property on functions; becomes the `[[Prototype]]` of objects made with `new Fn()` |
| `obj.[[Prototype]]` | The internal link every object has; `Object.getPrototypeOf(obj)` |
| `Fn.prototype.constructor` | Points back to `Fn` by default |

```js
function User(name) { this.name = name }
User.prototype.hello = function () { return `hi ${this.name}` }

const u = new User('Ana')
Object.getPrototypeOf(u) === User.prototype  // true
Object.getPrototypeOf(User) === Function.prototype // true
```

## What `new` does

1. Create an empty object whose prototype is `Ctor.prototype`.
2. Call `Ctor` with `this` set to that object.
3. If `Ctor` returns an object (or function), use that; otherwise return the new object.

```js
function myNew(Ctor, ...args) {
  const obj = Object.create(Ctor.prototype)
  const result = Ctor.apply(obj, args)
  const isObject = result !== null && (typeof result === 'object' || typeof result === 'function')
  return isObject ? result : obj
}
```

And `instanceof` walks the chain looking for `Ctor.prototype`:

```js
function myInstanceOf(obj, Ctor) {
  if (obj === null || (typeof obj !== 'object' && typeof obj !== 'function')) return false
  let proto = Object.getPrototypeOf(obj)
  while (proto) {
    if (proto === Ctor.prototype) return true
    proto = Object.getPrototypeOf(proto)
  }
  return false
}
```

(The real operator first checks `Ctor[Symbol.hasInstance]`.)

## `Object.create`

- `Object.create(proto)` makes an object with the given prototype, no constructor call.
- `Object.create(null)` makes a dictionary with no inherited keys (`toString`, `__proto__` etc. are absent). A `Map` is usually better for dynamic keys.
- Optional second argument is property descriptors.

## Classes as sugar

```js
class Animal {
  static count = 0
  #secret = 'hidden'          // private field
  name                        // public field, set per instance

  constructor(name) {
    this.name = name
    Animal.count++
  }
  speak() { return `${this.name} makes a sound` } // on Animal.prototype
  get secretLength() { return this.#secret.length }
  static isAnimal(x) { return #secret in x }      // brand check
}

class Dog extends Animal {
  speak() { return `${super.speak()} — woof` }
}
```

Roughly equivalent to a constructor function plus methods on `prototype` plus `Object.setPrototypeOf(Dog.prototype, Animal.prototype)` and `Object.setPrototypeOf(Dog, Animal)` (so statics inherit).

### Where classes differ from functions

| Behaviour | `function` constructor | `class` |
|---|---|---|
| Call without `new` | Runs (with wrong `this`) | Throws TypeError |
| Hoisting | Fully hoisted | TDZ until the declaration |
| Strict mode | Opt-in | Always |
| Methods enumerable | Yes, if assigned | No |
| Derived constructor `this` | Available immediately | ReferenceError until `super()` returns |
| Private state | Closures or `WeakMap` | `#fields`, `#methods`, `static #x` |

## Private fields

- `#x` is truly private: inaccessible from outside the class body, invisible to `Object.keys`, `JSON.stringify`, proxies and reflection.
- Accessing `#x` on an object without it throws TypeError; use `#x in obj` to check.
- Subclasses cannot access a parent's `#x` directly; expose a protected-style accessor or method if needed.
- Private names are per class declaration; two instances of the same class can read each other's `#x` (useful in `equals(other)`).
- Static initialisation blocks (`static { ... }`) run once when the class is evaluated.

## Inheritance gotchas

```js
// 1. Shared mutable state on the prototype
function Team() {}
Team.prototype.members = []
const a = new Team(), b = new Team()
a.members.push('x')
b.members // ['x'] — both share one array; initialise in the constructor instead

// 2. Using `this` before super()
class Child extends Animal {
  constructor() {
    this.x = 1 // ReferenceError
    super('c')
  }
}

// 3. Parent constructor calls an overridden method before child fields exist
class Base {
  constructor() { this.init() }
  init() {}
}
class Derived extends Base {
  value = 42
  init() { console.log(this.value) } // undefined: fields are set after super() returns
}
```

More traps:

- Replacing `Fn.prototype = {...}` wipes `constructor`; restore it if anything relies on it.
- `instanceof` fails across realms (iframes, workers); use `Array.isArray` or brand checks.
- Arrow class fields aren't on the prototype, so `super.handler()` can't reach them.
- Deep hierarchies are brittle; interviewers like hearing "prefer composition" with a concrete example.

## Common interview questions

**What is prototypal inheritance?**
Objects delegate failed property lookups to their prototype object, forming a chain. Methods are shared through the chain instead of copied.

**Difference between `__proto__` and `prototype`?**
`prototype` is a property on constructor functions used to set up new instances. `__proto__` is a legacy accessor for any object's actual prototype link; use `Object.getPrototypeOf`/`setPrototypeOf`.

**Are classes just syntactic sugar?**
Mostly, but not entirely: they enforce `new`, are strict, have a TDZ, non-enumerable methods, `super` and derived-constructor rules, and true private fields that functions can't express.

**How would you implement inheritance without `class`?**
Call the parent constructor with `Parent.call(this, ...)`, then set `Child.prototype = Object.create(Parent.prototype)` and restore `Child.prototype.constructor = Child`.

**Why is `Object.setPrototypeOf` discouraged on hot objects?**
Changing an existing object's prototype invalidates engine optimisations; create objects with the right prototype up front with `Object.create` or `new`.

**How do you check for an own property?**
`Object.hasOwn(obj, key)`, which also works for `Object.create(null)` objects that lack `hasOwnProperty`.

## Pitfalls

- Mutating built-in prototypes (`Array.prototype.last = ...`) — collisions with future standard methods.
- Assuming `for...in` only sees own keys.
- Forgetting `super()` in a derived constructor that declares its own constructor.
- Expecting private fields to show up in `structuredClone` or `JSON.stringify`: they don't.
