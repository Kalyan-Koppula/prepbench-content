---
title: Route matcher
difficulty: Medium
order: 5
tags: [strings, routing, parsing]
frequency: medium
exports: [matchRoute]
hints:
  - Drop the query and hash, then split both the pattern and the path on `/` and ignore empty segments.
  - Walk the pattern segments with an index into the path segments. Each kind of segment (static, `:param`, `:param?`, `*`) has one rule.
  - After the walk, leftover path segments mean no match, unless a `*` consumed them.
---

Implement `matchRoute(pattern, path)`, the core of a client-side router. It returns an object of extracted params if `path` matches `pattern`, or `null` if it doesn't.

Pattern segments:

| Segment | Matches |
|---|---|
| `users` | exactly that text (case-sensitive) |
| `:id` | any one non-empty segment; stored as `params.id` |
| `:id?` | optional: one segment if present. Optional params only appear at the end of a pattern. |
| `*` | only as the last segment: the rest of the path (zero or more segments), stored as `params['*']` joined with `/` (`''` if nothing is left) |

```js
matchRoute('/users/:id/posts/:postId?', '/users/42/posts')      // { id: '42' }
matchRoute('/users/:id/posts/:postId?', '/users/42/posts/7')    // { id: '42', postId: '7' }
matchRoute('/files/*', '/files/docs/2024/report.pdf')          // { '*': 'docs/2024/report.pdf' }
matchRoute('/users/:id', '/users/42/edit')                     // null
```

## Notes

- Empty segments are ignored on both sides, so leading, trailing and doubled slashes don't matter.
- Anything from the first `?` or `#` in `path` is ignored.
- Param values (and each segment captured by `*`) are percent-decoded. If decoding fails, the route doesn't match.
- An optional param that is absent is **not a key** of the result (not even with `undefined`).
- A static route that matches returns `{}`.
