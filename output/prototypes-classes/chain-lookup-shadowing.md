---
title: Shadowing a prototype property
difficulty: Easy
order: 1
tags: [prototype-chain, shadowing]
frequency: high
expected: |
  woof 4
  false true
  generic
  generic
---

```js
const animal = { sound: 'generic', legs: 4 }
const dog = Object.create(animal)
dog.sound = 'woof'

console.log(dog.sound, dog.legs)
console.log(dog.hasOwnProperty('legs'), 'legs' in dog)

delete dog.sound
console.log(dog.sound)

delete dog.sound
console.log(dog.sound)
```

## Explanation

`Object.create(animal)` makes an empty object whose prototype is `animal`.

1. Writing `dog.sound` creates an **own** property on `dog` that shadows `animal.sound`. Reading `legs` finds nothing on `dog` and walks up to `animal`: `woof 4`.
2. `hasOwnProperty` checks only the object itself (`false`); `in` checks the whole chain (`true`).
3. `delete dog.sound` removes the own property, which un-shadows the prototype's: `generic`.
4. `delete` only ever touches own properties. The second delete finds nothing on `dog` and does nothing; `animal.sound` survives: `generic`.

Rule to remember: reads walk the chain, writes and deletes only touch the object itself.
