---
title: Generics and Type-Level Programming
order: 2
summary: Generics and constraints, keyof and indexed access, mapped and conditional types, infer, template literals, recursion, and the built-in utility types implemented from scratch.
---

Some frontend loops include a "type challenge": implement `Pick`, type a `get(obj, 'a.b.c')`, or make an event emitter type-safe. The building blocks are few. Type-level TypeScript is a small functional language: generics are parameters, conditional types are `if`, `infer` is pattern matching, mapped types are `map`, and recursion is the only loop.

## Generics and constraints

```ts
function first<T>(items: readonly T[]): T | undefined {
  return items[0]
}

function prop<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}
const user = { name: 'Ada', age: 36 }
const age = prop(user, 'age')   // number
prop(user, 'email')             // error: not a key of user

function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b
}
```

- Let callers infer type arguments; write `<T>` explicitly only when inference can't.
- A type parameter used only once is usually unnecessary: `function f<T>(x: T): void` is just `(x: unknown) => void`.
- Defaults: `interface Box<T = string> { value: T }`.
- `const` type parameters (TS 5.0) infer literal types as if the caller wrote `as const`:

```ts
function tuple<const T extends readonly unknown[]>(...xs: T): T { return xs }
const t = tuple('a', 1) // readonly ['a', 1]
```

## `keyof`, `typeof` and indexed access

```ts
const config = { api: 'https://x.dev', retries: 3, debug: false }
type Config = typeof config               // { api: string; retries: number; debug: boolean }
type ConfigKey = keyof Config             // 'api' | 'retries' | 'debug'
type Retries = Config['retries']          // number
type Values = Config[keyof Config]        // string | number | boolean

const roles = ['admin', 'editor', 'viewer'] as const
type Role = (typeof roles)[number]        // 'admin' | 'editor' | 'viewer'

type Item = Array<{ id: string; tags: string[] }>[number] // element type
```

`typeof` in a type position reads the type of a value; `keyof` on a type with an index signature `{ [k: string]: T }` gives `string | number`.

## Mapped types and key remapping

```ts
type Flags<T> = { [K in keyof T]: boolean }

type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K]
}
type UserGetters = Getters<{ name: string; age: number }>
// { getName: () => string; getAge: () => number }

type OnlyStrings<T> = { [K in keyof T as T[K] extends string ? K : never]: T[K] }

type Mutable<T> = { -readonly [K in keyof T]: T[K] }
type Concrete<T> = { [K in keyof T]-?: T[K] }
```

`as` remaps keys; remapping to `never` drops the key. `+`/`-` add or remove `readonly` and `?`. Mapping over `keyof T` where `T` is a type parameter is homomorphic: it preserves the original modifiers, and mapping over an array or tuple type produces an array or tuple.

## Conditional types and distribution

```ts
type IsString<T> = T extends string ? true : false
type A = IsString<'x'>          // true
type B = IsString<string | 1>   // boolean: distributed to true | false
```

When the checked type is a naked type parameter, a conditional distributes over each union member. Wrap both sides in a tuple to stop that:

```ts
type IsStringStrict<T> = [T] extends [string] ? true : false
type C = IsStringStrict<string | 1> // false

type IsNever<T> = [T] extends [never] ? true : false // naked T would give never
```

`never` is the empty union, so distributing over it yields `never`; that's why `IsNever` needs the tuple wrapper.

## `infer`

```ts
type ElementOf<T> = T extends readonly (infer U)[] ? U : never
type Unwrap<T> = T extends Promise<infer U> ? U : T
type FirstArg<F> = F extends (first: infer A, ...rest: any[]) => any ? A : never
type Head<T extends readonly unknown[]> = T extends readonly [infer H, ...unknown[]] ? H : never
type Last<T extends readonly unknown[]> = T extends readonly [...unknown[], infer L] ? L : never

// infer with a constraint (TS 4.7+)
type NumericString<T> = T extends `${infer N extends number}` ? N : never
type N = NumericString<'42'> // 42
```

`infer` declares a type variable inside the `extends` pattern and binds whatever matches.

## Template literal types

```ts
type EventName<T extends string> = `on${Capitalize<T>}`
type Handlers = EventName<'click' | 'focus'> // 'onClick' | 'onFocus'

type Split<S extends string, D extends string> =
  S extends `${infer Head}${D}${infer Tail}` ? [Head, ...Split<Tail, D>] : [S]
type Parts = Split<'a.b.c', '.'> // ['a', 'b', 'c']

type CssLength = `${number}px` | `${number}rem`
const w: CssLength = '12px' // ok; '12em' is an error
```

Built-in string helpers: `Uppercase`, `Lowercase`, `Capitalize`, `Uncapitalize`. Unions inside a template expand to the cross product, which can explode in size.

## Recursive types

```ts
type Json = string | number | boolean | null | Json[] | { [key: string]: Json }

type DeepReadonly<T> = T extends (...args: any[]) => any
  ? T
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T

type Paths<T> = T extends object
  ? { [K in keyof T & string]: K | `${K}.${Paths<T[K]>}` }[keyof T & string]
  : never

type PathValue<T, P extends string> =
  P extends `${infer K}.${infer Rest}`
    ? K extends keyof T ? PathValue<T[K], Rest> : never
    : P extends keyof T ? T[P] : never

declare function get<T, P extends Paths<T>>(obj: T, path: P): PathValue<T, P>
const settings = { theme: { color: 'dark', size: 14 } }
const size = get(settings, 'theme.size') // number
```

The compiler caps instantiation depth (around 1000 for tail-recursive conditionals, much less otherwise), so very deep or wide recursion fails with "Type instantiation is excessively deep". `Paths` over large or cyclic types is a common culprit.

## Implementing the built-in utility types

```ts
type MyPartial<T> = { [K in keyof T]?: T[K] }
type MyRequired<T> = { [K in keyof T]-?: T[K] }
type MyReadonly<T> = { readonly [K in keyof T]: T[K] }
type MyRecord<K extends keyof any, V> = { [P in K]: V }
type MyPick<T, K extends keyof T> = { [P in K]: T[P] }
type MyExclude<T, U> = T extends U ? never : T          // distributive
type MyExtract<T, U> = T extends U ? T : never
type MyOmit<T, K extends keyof any> = MyPick<T, MyExclude<keyof T, K>>
type MyNonNullable<T> = T & {}
type MyReturnType<F extends (...args: any) => any> = F extends (...args: any) => infer R ? R : any
type MyParameters<F extends (...args: any) => any> = F extends (...args: infer P) => any ? P : never
type MyAwaited<T> =
  T extends null | undefined ? T
  : T extends object & { then(onfulfilled: infer F, ...args: infer _): any }
    ? F extends (value: infer V, ...args: infer _) => any ? MyAwaited<V> : never
    : T
```

Points worth saying while you write them:

- `Omit`'s key parameter is `keyof any` (any string, number or symbol), not `keyof T`, so omitting a non-existent key isn't an error. Write a `StrictOmit<T, K extends keyof T>` if you want that check.
- `Exclude` relies on distribution; `Omit` is `Pick` plus `Exclude` on the keys.
- `NonNullable<T>` is `T & {}` since TS 4.8; the older form was `T extends null | undefined ? never : T`.
- `Awaited` unwraps recursively and works on any thenable, mirroring what `await` does at runtime.

### Testing type-level code

```ts
type Equal<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? true : false
type Expect<T extends true> = T

type cases = [
  Expect<Equal<MyPick<{ a: 1; b: 2 }, 'a'>, { a: 1 }>>,
  Expect<Equal<MyExclude<'a' | 'b' | 'c', 'a'>, 'b' | 'c'>>,
  Expect<Equal<MyAwaited<Promise<Promise<string>>>, string>>,
]
```

This `Equal` is stricter than mutual assignability: it distinguishes `any` from other types and `readonly` from mutable properties.

## Worked example: a typed event emitter

Type-level features pay off when they connect several values. An event emitter where each event name fixes its payload type:

```ts
type Events = {
  login: { userId: string }
  logout: undefined
  message: { from: string; text: string }
}

class TypedEmitter<E extends Record<string, unknown>> {
  private listeners: { [K in keyof E]?: Array<(payload: E[K]) => void> } = {}

  on<K extends keyof E>(event: K, listener: (payload: E[K]) => void): () => void {
    const list = (this.listeners[event] ??= [])
    list.push(listener)
    return () => {
      this.listeners[event] = list.filter((l) => l !== listener)
    }
  }

  emit<K extends keyof E>(event: K, ...args: E[K] extends undefined ? [] : [payload: E[K]]): void {
    const payload = args[0] as E[K]
    this.listeners[event]?.forEach((listener) => listener(payload))
  }
}

const bus = new TypedEmitter<Events>()
bus.on('message', (m) => m.text.toUpperCase()) // m: { from: string; text: string }
bus.emit('login', { userId: '42' })
bus.emit('logout') // no payload allowed
bus.emit('message', { from: 'ana' }) // error: property 'text' is missing
```

Each feature does one job:

| Feature | Job here |
| --- | --- |
| Generic constraint `E extends Record<string, unknown>` | Any map of event names to payloads |
| `K extends keyof E` | The event name must exist |
| Indexed access `E[K]` | The payload type for that event |
| Mapped type `{ [K in keyof E]?: … }` | One listener list per event, correctly typed |
| Conditional rest parameter | No payload argument for `undefined` events |

## Worked example: typing a path getter

A function that reads `get(obj, 'user.address.city')` with the result type computed from the path:

```ts
type PathValue<T, P extends string> = P extends `${infer Head}.${infer Rest}`
  ? Head extends keyof T
    ? PathValue<T[Head], Rest>
    : never
  : P extends keyof T
    ? T[P]
    : never

type Data = { user: { address: { city: string; zip: number } } }

type City = PathValue<Data, 'user.address.city'> // string
type Zip = PathValue<Data, 'user.address.zip'> // number
type Bad = PathValue<Data, 'user.phone'> // never
```

Step by step for `'user.address.city'`:

| Step | `P` | Matches `Head.Rest`? | Recurse into |
| --- | --- | --- | --- |
| 1 | `user.address.city` | Head `user`, Rest `address.city` | `Data['user']` |
| 2 | `address.city` | Head `address`, Rest `city` | `…['address']` |
| 3 | `city` | no dot | `P extends keyof T`: `string` |

Template literal types split the string, `infer` captures the pieces, and recursion walks the object type. Real libraries add array indices and depth limits, because deeply recursive types slow the compiler.

## When not to use type-level programming

Clever types have costs: slower editor feedback, unreadable error messages, and code few teammates can change. Reach for them in **library boundaries** (a router, a form library, an event bus) where one complex type makes hundreds of call sites safe. In application code, prefer plain interfaces, unions and a few generics. A good test: if a new team member can't explain the type after a minute, simplify it or add a named helper type with a comment and an example.

## Variance in one paragraph

Function parameters are checked contravariantly under `strictFunctionTypes` (a handler for `Animal` can be used where a handler for `Dog` is expected, not the reverse), but methods declared with method syntax are checked bivariantly for compatibility with common DOM patterns. Arrays are treated covariantly, which is unsound for writes. You can annotate variance explicitly with `in` and `out` on type parameters (`interface Producer<out T>`), mostly for performance or documentation.

## Common interview questions

**What does `K extends keyof T` buy you?**
It restricts the key argument to real property names of `T`, and lets the return type be the precise `T[K]`. Typos become compile errors and the result keeps its specific type.

**What is a distributive conditional type?**
A conditional whose checked type is a naked type parameter applies separately to each member of a union argument, and the results are unioned. Wrapping in a one-element tuple, `[T] extends [U]`, turns distribution off.

**How do `Pick` and `Omit` differ in their constraints?**
`Pick<T, K extends keyof T>` only accepts existing keys. `Omit<T, K extends keyof any>` accepts any key, so it won't flag misspellings; a stricter custom version is common in codebases.

**What does `infer` do?**
It introduces a type variable inside the `extends` clause of a conditional type and binds it to whatever part of the type matches the pattern. That's how `ReturnType`, `Parameters` and `Awaited` extract pieces of a type.

**Why does `IsNever<never>` return `never` instead of `true` if written naively?**
`never` is an empty union, and a distributive conditional over an empty union produces nothing, which is `never`. Wrapping both sides in tuples stops distribution and returns `true`.

**How would you type a deep `get(obj, 'a.b.c')`?**
Generate the valid dotted paths with a recursive mapped type and template literals, then resolve the value type by splitting the path with `infer` and indexing step by step. Mention the recursion-depth limit for large types.

**When would you use a `const` type parameter?**
When a function should infer literal and tuple types from its arguments, such as route definitions or tuple builders, without forcing callers to write `as const`.

## Key takeaways

- Generics link the types of inputs and outputs; constraints say what a type parameter must support.
- `keyof`, indexed access and mapped types transform object types property by property.
- Conditional types branch on assignability and distribute over unions; `infer` extracts parts of a type.
- Template literal types and recursion can parse strings at the type level.
- The built-in utility types are short mapped and conditional types you can write yourself.
- Use advanced types at library boundaries; keep application types simple.
