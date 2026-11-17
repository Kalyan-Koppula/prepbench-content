---
title: MyReadonly
difficulty: Easy
order: 2
tags: [mapped-types, modifiers]
frequency: high
hints:
  - Map over every key of `T` with `[K in keyof T]`.
  - A mapped type can add a modifier in front of the key, the same way an interface property declares one.
---

Implement `MyReadonly<T>` without using the built-in `Readonly`. Every top-level property of the result is `readonly`; everything else about each property (its type, whether it's optional) stays the same.

```ts
interface Config {
  port: number
  host?: string
}

declare const config: MyReadonly<Config>
config.port = 8080 // error: port is read-only
```

The change is shallow: an object nested inside a property stays mutable. Applied to an array type, the result should be the read-only version of that array.
