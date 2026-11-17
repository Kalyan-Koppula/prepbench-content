---
title: TypeScript
order: 27
module: typescript
summary: Structural typing, unions and narrowing, unknown/any/never, generics, keyof and indexed access, mapped and conditional types with infer, utility types, satisfies and as const, enums, strict flags and typing React.
---

## What does structural typing mean in practice?

Compatibility is decided by shape, not by name or declaration: any value with the required members is assignable, even if it was never declared as that type. Two interfaces with identical members are interchangeable, and so are class instances (except for classes with private or protected members). It mirrors how JavaScript duck typing works.

## How do you get nominal-style types in a structural type system?

Brand them with a phantom property: `type UserId = string & { readonly __brand: 'UserId' }`, created only through a validating function that returns `id as UserId`. A plain string or an `OrderId` can then no longer be passed where a `UserId` is expected, at zero runtime cost.

## Why does an object literal with an extra property error, but the same object passed via a variable doesn't?

Excess property checking only applies to fresh object literals assigned directly to a typed target, because an unknown extra key there is almost always a typo. Once the object is in a variable, normal structural rules apply and extra members are allowed.

## When do you choose `type` over `interface`?

Use `type` for anything that isn't a plain object shape: unions, tuples, function types, mapped and conditional types. Use `interface` when you want declaration merging (augmenting a library or `Window`) or object hierarchies via `extends`, which also give clearer errors. For plain object shapes either works; pick one convention and stay consistent.

## How does a union of object types differ from an intersection?

A value of `A | B` is one or the other, so without narrowing you can only access members both share. A value of `A & B` has every member of both. Intersecting incompatible property types, like `{ id: string } & { id: number }`, makes that property `never`.

## Why are discriminated unions the go-to pattern for modelling state?

Give each variant a literal tag, e.g. `{ status: 'loading' } | { status: 'error'; error: Error } | { status: 'success'; data: T }`. Checking the tag narrows to exactly one variant, so `data` is only reachable in the success branch, and impossible combinations like "loading with an error" can't be represented.

## How do you make the compiler fail when a new union member isn't handled?

Add an exhaustiveness check in the `default` branch: `const unreachable: never = value;`. If every member is handled, `value` has narrowed to `never` and it compiles; add a new variant without a case and the assignment errors, pointing straight at the missing branch.

## Which constructs narrow a type?

`typeof` for primitives, `instanceof` for classes, the `in` operator, equality and truthiness checks, discriminant property checks, `Array.isArray`, and user-defined type predicates and assertion functions. Control-flow analysis tracks these through `if`, `switch`, early returns and `&&`.

## How do you write a user-defined type guard, and what's the risk?

A function returning a type predicate: `function isUser(x: unknown): x is User { ... }`. The compiler trusts the predicate without checking the body, so a sloppy check produces a type that lies. Since TypeScript 5.5, simple guards like `arr.filter(x => x !== undefined)` are inferred automatically.

## What is an assertion function?

A function whose return type is `asserts value is T` (or `asserts condition`) that throws when the check fails. After calling it, the variable is narrowed for the rest of the scope, which suits invariants like `assertIsDefined(user)` at the top of a function. It must be called through an explicitly typed reference for the narrowing to apply.

## Why should you prefer `unknown` over `any`?

`any` turns off type checking for that value and spreads silently through everything it touches. `unknown` accepts any value too, but you must narrow it before doing anything with it, so untrusted data such as `JSON.parse` output or a caught error stays safe. Under `strict`, `catch (e)` gives you `unknown`.

## Where does `never` show up, and why is it useful?

It's the empty type: the return type of functions that always throw or never return, what a variable narrows to in an impossible branch, and the result of contradictory intersections like `string & number`. In conditional types, returning `never` removes members from a union, which is how `Exclude` works.

## What's the difference between `void` and `undefined` as a return type?

`undefined` means the function must actually return undefined. A function type returning `void` means the caller ignores the result, so a function that returns a value is still assignable to it: that's why `arr.forEach(x => list.push(x))` compiles even though `push` returns a number.

## Why constrain a generic with `extends`?

To use members of the type parameter safely and to relate parameters to each other: `function getProp<T, K extends keyof T>(obj: T, key: K): T[K]` only accepts real keys and returns the matching property type. Without the constraint, `T` is treated as unknown inside the function.

## When is a generic type parameter unnecessary?

When it appears only once in the signature. A generic is there to relate types, such as an input to an output or two arguments to each other; `function log<T>(x: T): void` adds nothing over `x: unknown`. Unneeded generics make signatures harder to read and errors worse.

## What does a `const` type parameter do?

Since TypeScript 5.0, `function route<const T extends readonly string[]>(paths: T)` makes inference treat the argument as if the caller wrote `as const`, so `route(['a', 'b'])` infers `readonly ['a', 'b']` instead of `string[]`. It's handy for config-driven APIs that need literal types without burdening callers.

## What do `keyof`, `typeof` and indexed access types each give you?

`keyof T` is the union of `T`'s keys. `typeof value` in a type position gets the type of a runtime value. `T['key']` gets a property's type, and `T[number]` gets an array's element type. Combined: `keyof typeof config` gives the keys of a plain object.

## How do you derive a string union from an array of values?

Declare the array `as const` and index it with `number`: `const roles = ['admin', 'editor', 'viewer'] as const; type Role = (typeof roles)[number];`. The array stays the runtime source of truth for validation or dropdowns, and the type can't drift from it.

## What does `as const` do?

It infers the narrowest type for a literal expression: string and number literals stay literal, arrays become readonly tuples, and object properties become `readonly` literals, all the way down. It changes types only and emits nothing at runtime.

## How do you write a mapped type, and what can you do with modifiers and `as`?

`{ [K in keyof T]: T[K] }` iterates over keys. Add or strip modifiers with `readonly`, `?`, `-readonly` and `-?`. Remap keys with `as`, e.g. `` [K in keyof T as `get${Capitalize<K & string>}`]: () => T[K] ``, and filter keys out by remapping them to `never`.

## How do conditional types behave when given a union?

When the checked type is a bare type parameter, the conditional distributes over each union member: `ToArray<string | number>` with `T extends unknown ? T[] : never` gives `string[] | number[]`. Wrap both sides in a tuple, `[T] extends [unknown]`, to evaluate the union as a whole instead.

## What does `infer` do in a conditional type?

It declares a type variable inside the `extends` clause and captures whatever matches at that position: `type ElementOf<T> = T extends readonly (infer U)[] ? U : never`. It's how `ReturnType`, `Parameters` and `Awaited` pull types out of other types.

## How would you implement `ReturnType` yourself?

`type MyReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : never;`. The constraint ensures only functions are passed, and `infer R` captures the return position. `Parameters` is the same idea with `infer P` in the argument list.

## Why don't `Partial` and `Readonly` protect nested objects?

They're shallow mapped types: they only change the top-level properties, so `Readonly<User>` still lets you mutate `user.address.city`. For deep behaviour write a recursive mapped type, or for immutability use `as const` on literals or `Object.freeze` at runtime, which is also shallow.

## What's the gotcha with `Omit` on a union type?

`Omit` isn't distributive: it computes `keyof` the whole union, which is only the shared keys, so `Omit<A | B, 'id'>` loses each variant's unique properties. It also accepts keys that don't exist on the type, so typos slip through. Use a distributive helper: `type DistributiveOmit<T, K extends keyof any> = T extends unknown ? Omit<T, K> : never`.

## When would you use `Record<K, V>`?

To type an object whose keys are a known union, e.g. `Record<Status, string>`, which forces every status to have an entry, so adding a status breaks compilation until it's handled. With `Record<string, V>`, reading any key returns `V` rather than `V | undefined`, so enable `noUncheckedIndexedAccess` or use a `Map`.

## How do you get the resolved type of an async function's result?

`Awaited<ReturnType<typeof fetchUser>>`. `ReturnType` gives `Promise<User>`, and `Awaited` unwraps promises recursively, the same way `await` does. `Parameters<typeof fn>` similarly gives the argument tuple, useful for wrappers.

## What do `NonNullable`, `Exclude` and `Extract` do?

`NonNullable<T>` removes `null` and `undefined` from `T`. `Exclude<T, U>` drops union members assignable to `U`, and `Extract<T, U>` keeps only those members. All three work by distributing a conditional type over the union.

## What problem does `satisfies` solve?

It checks that an expression conforms to a type without changing the expression's inferred type. With `const routes = { home: '/' } satisfies Record<string, string>`, typos and wrong value types are still caught, but `routes.home` keeps its precise type and only the real keys exist. A type annotation would widen to `Record<string, string>`.

## Why is `as` dangerous?

A type assertion tells the compiler to trust you; it only refuses when the two types don't overlap at all, and `as unknown as T` bypasses even that. Nothing checks at runtime, so a wrong assertion moves the error to a crash far from the cause. Prefer narrowing, `satisfies` or runtime validation; the non-null `!` operator has the same risk.

## Why do many teams avoid `enum`?

Enums emit runtime code, which makes them incompatible with type-stripping tools such as `erasableSyntaxOnly` and Node's built-in TypeScript support. Numeric enums also accept arbitrary numbers from `number` values, and `const enum` has pitfalls under `isolatedModules`. A union of string literals, or an `as const` object plus a derived union, gives the same safety with plain JavaScript.

## What is declaration merging, and when is it useful?

Interfaces with the same name in the same scope merge their members, and namespaces can merge with functions, classes and enums. Its main practical use is module augmentation: `declare module 'express' { interface Request { user?: User } }`, or extending `Window` in a `declare global` block.

## What does `strict: true` enable, and which part matters most?

A family of flags including `strictNullChecks`, `noImplicitAny`, `strictFunctionTypes`, `strictBindCallApply`, `strictPropertyInitialization`, `noImplicitThis`, `useUnknownInCatchVariables` and `alwaysStrict`, and new ones as they're added. `strictNullChecks` matters most: without it `null` and `undefined` are assignable to everything, which hides the most common runtime error.

## What does `noUncheckedIndexedAccess` catch that `strict` doesn't?

It adds `| undefined` to reads through index signatures and array indexes, so `arr[0]` is `T | undefined` and `dict[key]` must be checked. It isn't part of `strict` because it's noisy, but it catches real out-of-bounds and missing-key bugs, especially in new codebases.

## Why are method parameters checked more loosely than function-property parameters?

Under `strictFunctionTypes`, a property typed as a function (`onChange: (v: string) => void`) checks parameters contravariantly, which is sound. Method shorthand (`onChange(v: string): void`) stays bivariant for backwards compatibility, mainly so that `Array<Dog>` is assignable to `Array<Animal>`. Prefer property syntax in your own interfaces for stricter checking.

## What do template literal types let you do?

Build string types from other types: `` type Handler = `on${Capitalize<EventName>}` `` turns `'click' | 'focus'` into `'onClick' | 'onFocus'`. Combined with mapped types and `infer`, they type event names, CSS values, route params or i18n keys, e.g. extracting `':id'` segments from a path string.

## Why use `import type`?

It guarantees the import is erased from the emitted JavaScript, so it can't create a runtime dependency or an import cycle and works with single-file transpilers like esbuild and SWC. With `verbatimModuleSyntax` enabled, TypeScript requires `import type` for type-only imports and leaves all other imports untouched.

## How do you type event handlers in React?

Inline handlers infer their type, so annotation is only needed when the handler is declared separately: `const onChange = (e: React.ChangeEvent<HTMLInputElement>) => ...` or `const onChange: React.ChangeEventHandler<HTMLInputElement> = ...`. Read from `e.currentTarget`, which is typed as the element the handler is attached to; `e.target` can be any descendant, so it's typed loosely for most events.

## How do you type a ref to a DOM element in React 19?

`const inputRef = useRef<HTMLInputElement>(null)`, which gives a `RefObject<HTMLInputElement | null>`, so access it as `inputRef.current?.focus()`. The React 19 types require an initial argument to `useRef`, and since `ref` is now a regular prop on function components you type it as `ref?: React.Ref<HTMLInputElement>` in props.

## How do you type a component that forwards props to a native element?

Extend the element's props: `type ButtonProps = React.ComponentProps<'button'> & { variant: 'primary' | 'ghost' }`, then spread the rest onto `<button>`. Use `Omit` first if one of your props conflicts with a native one. For children, type them as `React.ReactNode`; `React.FC` hasn't added an implicit `children` prop since React 18's types.

## How do you write a generic React component?

Make the function itself generic: `function List<T>({ items, renderItem }: { items: T[]; renderItem: (item: T) => React.ReactNode })`, and `T` is inferred from `items` at the call site. For arrow functions in a `.tsx` file write `<T,>` so the parser doesn't read it as a JSX tag.
