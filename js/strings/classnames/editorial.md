**Key insight:** it is a recursive walk with one rule per type. Collect into an array and `join(' ')` at the end, so you never deal with leading, trailing or double spaces.

## Approach

1. `visit(value)`: return on falsy values first; that single check covers `null`, `undefined`, `false`, `0`, `''` and `NaN`.
2. Strings and numbers: push `String(value)`.
3. Arrays: `value.forEach(visit)`.
4. Objects: for each key in `Object.keys(value)` (own, enumerable keys), push it if the value is truthy.
5. Everything else (`true`, functions, symbols) falls through and is ignored.

## Pitfalls

- Building the string with `+= ' ' + cls` and trimming at the end; easy to get double spaces when items are skipped.
- `for…in` without an own-property check picks up inherited keys.
- Checking `typeof value === 'object'` before `Array.isArray`: arrays are objects, so their indices become class names.
- Pushing `0` because you only skip `null` and `undefined`.

## Follow-ups interviewers add

- **Dedupe** while keeping first-seen order (use a `Set`).
- **`classNames.bind(styles)`** for CSS modules: map each class through a lookup object.
- **TypeScript:** type `ClassValue` recursively, as the starter does.
- **Performance:** why the real library avoids recursion helpers and `arguments` slicing in hot render paths.
