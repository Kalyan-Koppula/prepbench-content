---
title: Default parameters get their own scope
difficulty: Hard
order: 15
tags: [default-parameters, scope, closures]
frequency: low
expected: |
  param body
---

```js
var step = 'global'

function run(read = () => step, step = 'param') {
  var step = 'body'
  console.log(read(), step)
}

run()
```

## Explanation

When a function has default parameter values, its parameters live in their own scope, separate from the variables declared in the body.

1. Parameters are initialised left to right. `read` becomes an arrow created in the **parameter scope**. It doesn't call anything yet.
2. `step` is a parameter too, so it shadows the global. Its default makes it `'param'`.
3. The body's `var step` is a **different** variable in the body scope. It starts as a copy of the parameter (`'param'`), then the assignment makes it `'body'`.
4. `read()` looks up `step` from where it was written: the parameter scope, which still holds `'param'`. The body's `step` is `'body'`.

Output: `param body`.

Rule to remember: closures in default values see the parameters, not variables later declared in the body.
