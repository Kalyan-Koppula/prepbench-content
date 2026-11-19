---
title: TypeScript for Frontend Interviews
order: 1
summary: Structural typing, type vs interface, narrowing, unknown/any/never, overloads, satisfies, as const, enums vs unions, strict flags, and the mistakes interviewers probe.
---

TypeScript questions in frontend loops come in two shapes: short conceptual questions during the JS screen ("`unknown` vs `any`?", "`type` or `interface`?") and typing exercises ("type this `fetchJson` helper", "make this API response safe"). Interviewers are checking whether you use the type system to model data and catch bugs, or just to silence the compiler.

## Structural typing

Types are compatible if their shapes are compatible, regardless of names.

```ts
interface Point { x: number; y: number }
class Vec { constructor(public x: number, public y: number) {} }

const p: Point = new Vec(1, 2) // fine: Vec has x and y

function len(p: Point) { return Math.hypot(p.x, p.y) }
const p3 = { x: 1, y: 2, z: 3 }
len(p3)                    // fine: extra properties allowed for a variable
len({ x: 1, y: 2, z: 3 })  // error: excess property check on a fresh object literal
```

Excess property checks only apply to object literals written directly where a type is expected; they catch typos like `{ colour: 'red' }`. When you need nominal behaviour (user IDs vs order IDs), use a brand:

```ts
type UserId = string & { readonly __brand: 'UserId' }
const asUserId = (s: string) => s as UserId
function loadUser(id: UserId) { /* … */ }
loadUser('abc')           // error
loadUser(asUserId('abc')) // ok
```

## `type` vs `interface`

| | `interface` | `type` |
|---|---|---|
| Object shapes | Yes | Yes |
| Unions, tuples, primitives, mapped/conditional types | No | Yes |
| Declaration merging | Yes (augment globals, library types) | No |
| Extending | `extends`, with conflicts reported as errors | `&` intersection, conflicts become `never` silently |
| Error messages and performance | Named in errors; cached relationships | Can expand inline |

A reasonable default: `interface` for object shapes that others may extend (props, public APIs), `type` for unions, function types and anything computed. Consistency within a codebase matters more than the choice.

## Unions and narrowing

```ts
type Result =
  | { status: 'loading' }
  | { status: 'success'; data: string[] }
  | { status: 'error'; error: Error }

function render(r: Result) {
  switch (r.status) {
    case 'loading': return 'Loading…'
    case 'success': return r.data.join(', ') // narrowed: data exists
    case 'error': return r.error.message
    default: {
      const unreachable: never = r // compile error if a new status is added
      return unreachable
    }
  }
}
```

Narrowing tools: `typeof`, `instanceof`, `in` (`'data' in r`), equality checks, truthiness, `Array.isArray`, discriminant properties, and user-defined type guards:

```ts
function isString(v: unknown): v is string { return typeof v === 'string' }

function assertIsDefined<T>(v: T, msg?: string): asserts v is NonNullable<T> {
  if (v == null) throw new Error(msg ?? 'Expected value')
}
```

Since TypeScript 5.5, simple guards like `arr.filter((x) => x !== undefined)` infer a type predicate automatically, so the result is narrowed without writing `x is T`.

Discriminated unions model states that can't coexist. Prefer them over a bag of optional fields like `{ loading?: boolean; data?: T; error?: Error }`, which permits impossible combinations.

## `unknown`, `any`, `never`

| Type | Meaning | Use |
|---|---|---|
| `any` | Opt out of checking; assignable to and from everything | Migration escape hatch; avoid |
| `unknown` | Could be anything; must narrow before use | `JSON.parse` results, `catch` variables, external input |
| `never` | No value possible | Exhaustiveness checks, functions that always throw, impossible branches |

```ts
async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

try { /* … */ } catch (err) {        // err: unknown under strict
  const message = err instanceof Error ? err.message : String(err)
}
```

Returning `unknown` from the network boundary forces validation (a hand-written guard or a schema library like Zod). `any` spreads: a single `any` makes every expression derived from it unchecked.

## How the compiler thinks: sets of values

The most useful mental model for TypeScript is that **a type is a set of values**:

- `string` is the set of all strings; `'a' | 'b'` is a set with two members.
- `A | B` (union) is the set of values in A **or** B.
- `A & B` (intersection) is the set of values in A **and** B. For object types that means "has all the properties of both".
- `never` is the empty set; `unknown` is the set of everything.
- "A is assignable to B" means A is a **subset** of B.

This explains results that otherwise look backwards:

```ts
type Named = { name: string }
type Aged = { age: number }

type Both = Named & Aged // values with name AND age: { name: string; age: number }
type Either = Named | Aged // values with at least one of them

declare const e: Either
e.name // error: an Aged value has no name; only members common to every option are safe

type Impossible = string & number // never: no value is both
```

It also explains why `{ name: string; age: number }` is assignable to `{ name: string }`: the set of objects with a name and an age is a subset of the set of objects with a name. That is structural typing.

## Type inference and widening

TypeScript infers types from values, and **widens** literal types when a value could change:

```ts
const mode = 'dark' // type 'dark': a const can't change
let theme = 'dark' // type string: a let might be reassigned
const config = { mode: 'dark' } // { mode: string }: properties are mutable

const fixed = { mode: 'dark' } as const // { readonly mode: 'dark' }
```

Widening is why passing `config.mode` to a function expecting `'light' | 'dark'` fails, and why `as const` or `satisfies` fixes it.

Inference flows in both directions:

- **From values to variables**: `const n = 42` is `number` (or `42` for a `const`).
- **From context to values** ("contextual typing"): in `button.addEventListener('click', (e) => …)`, `e` is inferred as `MouseEvent` from the parameter's declared type.
- **Best common type**: `[1, 'a']` becomes `(string | number)[]`.

Annotate function parameters and public return types; let inference handle local variables.

## Type guards and assertion functions

Narrowing works with built-in checks (`typeof`, `instanceof`, `in`, equality, truthiness). For your own checks, write a **type predicate**:

```ts
type Cat = { kind: 'cat'; meow(): void }
type Dog = { kind: 'dog'; bark(): void }

function isCat(pet: Cat | Dog): pet is Cat {
  return pet.kind === 'cat'
}

function speak(pet: Cat | Dog) {
  if (isCat(pet)) {
    pet.meow() // narrowed to Cat
  } else {
    pet.bark() // narrowed to Dog
  }
}
```

An **assertion function** narrows by throwing:

```ts
function assertDefined<T>(value: T, message: string): asserts value is NonNullable<T> {
  if (value === null || value === undefined) throw new Error(message)
}

const el = document.querySelector('#app')
assertDefined(el, 'missing #app')
el.append('ready') // el is Element here
```

A predicate is only as correct as its body: `pet is Cat` is a promise to the compiler that it can't verify.

## Validating data at the boundary

Types disappear at runtime. Data from `fetch`, `localStorage`, URL params or `postMessage` is `unknown` in reality, whatever you annotate it as. Validate it once at the boundary and derive the type from the validator:

```ts
import { z } from 'zod'

const User = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(['admin', 'member']),
})
type User = z.infer<typeof User> // the type and the runtime check can't drift apart

async function loadUser(id: string): Promise<User> {
  const res = await fetch(`/api/users/${id}`)
  return User.parse(await res.json()) // throws a descriptive error on bad data
}
```

Writing `const user = (await res.json()) as User` compiles, but it is a claim, not a check: a renamed field on the server becomes a runtime `undefined` far from its cause.

## Exhaustiveness checking

With a discriminated union, `never` turns "I forgot a case" into a compile error:

```ts
type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'square'; side: number }
  | { kind: 'triangle'; base: number; height: number }

function area(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2
    case 'square':
      return shape.side ** 2
    case 'triangle':
      return (shape.base * shape.height) / 2
    default: {
      const unreachable: never = shape // error here if a new kind is added and not handled
      return unreachable
    }
  }
}
```

## Function overloads

```ts
function parse(input: string): number
function parse(input: string[]): number[]
function parse(input: string | string[]): number | number[] {
  return Array.isArray(input) ? input.map(Number) : Number(input)
}

const a = parse('1')        // number
const b = parse(['1', '2']) // number[]
```

Callers see only the overload signatures; the implementation signature is hidden and must be compatible with all of them. Often a union parameter or a generic is simpler; reach for overloads when the return type depends on the argument shape in a way a single signature can't express cleanly.

## `as const` and `satisfies`

```ts
const ROUTES = { home: '/', profile: '/me' } as const
// { readonly home: '/'; readonly profile: '/me' }
type Route = (typeof ROUTES)[keyof typeof ROUTES] // '/' | '/me'

const sizes = ['sm', 'md', 'lg'] as const
type Size = (typeof sizes)[number] // 'sm' | 'md' | 'lg'

type Theme = Record<'primary' | 'danger', string | { light: string; dark: string }>
const theme = {
  primary: '#2563eb',
  danger: { light: '#dc2626', dark: '#f87171' },
} satisfies Theme

theme.primary.toUpperCase() // ok: still known to be a string
theme.danger.dark           // ok: still known to be the object
```

`satisfies` checks that a value conforms to a type without widening it to that type. A type annotation (`const theme: Theme = …`) would make both properties `string | { … }` and force narrowing everywhere. `as Type` is an assertion and should be the last resort: it can hide real errors.

## Enums vs union literals

```ts
enum Direction { Up, Down }      // numeric: Direction[0] === 'Up' (reverse mapping)
enum Status { Active = 'active' } // string enum: no reverse mapping

type StatusU = 'active' | 'inactive' // usually the better choice
```

Union literals have zero runtime cost, work with plain strings from APIs, and narrow naturally. Enums emit JavaScript objects, numeric enums accept any number in older TS versions, and they're incompatible with `erasableSyntaxOnly` and Node's type stripping. If you need a runtime list, use an `as const` object or array and derive the union from it. `const enum` inlines values but breaks with isolated-module transpilers.

## Strictness flags worth naming

| Flag | Catches |
|---|---|
| `strict` | Umbrella: `strictNullChecks`, `noImplicitAny`, `strictFunctionTypes`, `useUnknownInCatchVariables` and more |
| `noUncheckedIndexedAccess` | `arr[i]` and `record[key]` become `T \| undefined` |
| `exactOptionalPropertyTypes` | `{ a?: string }` no longer accepts an explicit `a: undefined` |
| `noImplicitOverride` | Requires `override` on overriding class members |
| `noFallthroughCasesInSwitch` | Missing `break` |
| `verbatimModuleSyntax` | Forces `import type` for type-only imports, predictable emit |
| `isolatedModules` | Code must be transpilable file by file (esbuild, SWC, Babel) |

## Mistakes interviewers probe

- Using `as` to make errors disappear, especially `as any` or `{} as User`.
- Optional-field soup instead of a discriminated union.
- Typing `JSON.parse` or `res.json()` results as a domain type without validation.
- `Function`, `Object` or `{}` as types; `{}` means "any non-nullish value".
- Forgetting that types are erased: no runtime checks, no `typeof T` at runtime.
- Using non-null assertions (`user!.name`) to dodge `strictNullChecks`.
- Over-annotating: let inference type locals and return values when they're obvious; annotate public boundaries.
- Believing `readonly` is deep, or that it prevents mutation at runtime.

## Common interview questions

**What's the difference between `unknown` and `any`?**
Both accept any value, but `unknown` can't be used until you narrow it, while `any` disables checking entirely. Use `unknown` for untrusted input so the compiler forces validation.

**When would you choose `interface` over `type`?**
For object shapes meant to be extended or augmented, such as component props or library types, where declaration merging and clear error names help. Use `type` for unions, tuples, function types and mapped or conditional types.

**What does `satisfies` do that an annotation doesn't?**
It checks conformance while keeping the expression's narrower inferred type. An annotation widens the variable to the declared type and loses literal and per-property detail.

**What is a discriminated union and why use it?**
A union of object types sharing a literal field such as `status` or `kind`. Checking that field narrows to one member, and a `never` default enforces exhaustiveness when new members are added.

**Why might a team ban enums?**
They generate runtime code, don't fit erasable-syntax tooling, numeric enums have loose assignability, and string unions plus `as const` objects cover the same needs. Many style guides prefer unions for that reason.

**What's structural typing, and when is it a problem?**
Compatibility is decided by shape, not by declared name. It becomes a problem when two concepts share a shape, like user and order IDs both being strings; branded types restore the distinction.

**What does `noUncheckedIndexedAccess` change?**
Index access on arrays and records includes `undefined` in the type, so you must handle the missing case. It catches real out-of-range bugs at the cost of some extra checks in loops.

**How do you type a function that never returns?**
Give it a `never` return type, as with a function that always throws or an infinite loop. Assertion functions use `asserts value is T` instead so the caller is narrowed afterwards.

## Key takeaways

- Types are sets of values: unions widen, intersections narrow, assignability is "subset of".
- TypeScript is structural: shape matters, not names.
- Literals widen unless the value is `const`; `as const` and `satisfies` keep them precise.
- Narrow with built-in checks, type predicates and assertion functions; use `never` for exhaustiveness.
- Types vanish at runtime: validate external data at the boundary and derive types from the validator.
- Prefer `unknown` to `any`, unions of literals to enums, and strict compiler settings.
