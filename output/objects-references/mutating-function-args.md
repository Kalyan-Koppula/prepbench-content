---
title: Mutating vs reassigning parameters
difficulty: Medium
order: 4
tags: [references, functions]
frequency: high
expected: |
  replaced
  changed 1 4
---

```js
function update(user, count, list) {
  user.name = 'changed'
  user = { name: 'replaced' }
  count += 1
  list.push(4)
  list = []
  return user.name
}

const u = { name: 'orig' }
let c = 1
const l = [1, 2, 3]

console.log(update(u, c, l))
console.log(u.name, c, l.length)
```

## Explanation

JavaScript passes arguments **by value**, and for objects that value is a reference ("call by sharing").

1. `user.name = 'changed'` mutates the caller's object through the shared reference.
2. `user = { ... }` rebinds the local parameter only. From here `user` is a different object, so the function returns `'replaced'`, but `u` is unaffected.
3. `count += 1` changes the local copy of a primitive; `c` stays `1`.
4. `list.push(4)` mutates the caller's array (length 4). `list = []` only rebinds the local name.

Rule to remember: a function can change what a passed object *contains*, but never which object the caller's variable points to.
