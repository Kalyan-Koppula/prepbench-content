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
