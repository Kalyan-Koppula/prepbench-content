---
title: Get by Path
difficulty: Easy
order: 4
tags: [objects, strings, parsing]
frequency: high
exports: [get]
hints:
  - Turn the path into a list of keys first; `'a.b[0].c'` becomes `['a', 'b', '0', 'c']`.
  - Walk the keys one at a time and stop early as soon as the current value is `null` or `undefined`.
  - The default replaces `undefined` only; `null`, `0` and `''` are real values.
---

Implement `get(obj, path, defaultValue)`, which reads a nested value safely, like lodash's `_.get`.

```js
const state = { user: { posts: [{ title: 'Hello' }] } }
get(state, 'user.posts[0].title')            // 'Hello'
get(state, ['user', 'posts', 0, 'title'])    // 'Hello'
get(state, 'user.profile.avatar', 'none.png') // 'none.png'
```

## Notes

- `path` is either a string or an array of keys.
- In a string path, keys are separated by `.`, and `[n]` is an index: `'a[0].b'`, `'a.0.b'` and `'list[1][2]'` are all valid. A path may start with an index (`'[0].id'`). You don't need to support quoted keys like `a["b.c"]`.
- An array path is used as is, so its keys may contain dots.
- If a step hits `null` or `undefined`, stop and return `defaultValue` (never throw).
- Return `defaultValue` when the resolved value is `undefined`. Any other value, including `null`, `0`, `false` and `''`, is returned as is.
- Properties of primitives can be read along the way (`'name.length'`).
- An empty path (`''` or `[]`) returns `obj` itself.
