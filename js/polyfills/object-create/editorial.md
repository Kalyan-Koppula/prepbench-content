**Key insight:** `Object.create` is two primitive operations glued together: "make an empty object whose prototype is X" and "define these properties on it". Both exist on their own (`Object.setPrototypeOf`, `Object.defineProperties`).

## Approach

1. If `proto` isn't `null`, an object or a function, throw a `TypeError`.
2. `obj = Object.setPrototypeOf({}, proto)`.
3. If `propertiesObject !== undefined`, `Object.defineProperties(obj, propertiesObject)`.
4. Return `obj`.

The pre-ES5 polyfill was `function F() {} F.prototype = proto; return new F()`. It can't do `null` (a `null` prototype on a constructor falls back to `Object.prototype` when you call `new`) and can't do descriptors.

## Walkthrough

`objectCreate(animal, { name: { value: 'Rex', enumerable: true } })`:

| Step | Result |
| --- | --- |
| 1 | `{}` with its prototype set to `animal` |
| 2 | `defineProperties` adds `name` (read-only, because `writable` defaults to false) |

`objectCreate(null)` makes an object with no prototype at all: no `toString`, no `hasOwnProperty`, a safe dictionary.

## Complexity

`O(k)` for `k` property descriptors.

## Edge cases to test

- The prototype is set correctly.
- `null` prototype objects.
- Property descriptors with their defaults (non-writable, non-enumerable, non-configurable).
- Invalid prototypes (numbers, strings) throw.

## Pitfalls

- The `new F()` trick with `proto = null` silently gives you `Object.prototype`.
- Copying properties from `proto` onto the new object instead of linking to it: later changes to `proto` aren't seen.
- Assigning descriptor values with `obj[key] = desc.value`: everything becomes writable, enumerable and configurable, and getters are lost.
- Accepting `undefined` as "no prototype". Only `null` means that.

## Follow-ups interviewers add

- **Why `Object.create(null)` for dictionaries:** keys like `__proto__`, `constructor` and `toString` are safe; compare with `Map`.
- **Classical inheritance by hand:** `Child.prototype = Object.create(Parent.prototype)` and why the `constructor` property needs fixing.
- **`setPrototypeOf` performance:** why engines warn against changing an existing object's prototype, and why it's fine on a fresh `{}`.
- **`__proto__` in object literals:** `{ __proto__: proto }` as yet another way.

## In the interview

The classic pre-ES5 polyfill used a temporary constructor (`function F() {}; F.prototype = proto; return new F()`); mention it to show you know why `Object.create` was added.
