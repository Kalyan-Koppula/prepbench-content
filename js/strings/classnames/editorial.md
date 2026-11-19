**Key insight:** it is a recursive walk with one rule per type. Collect into an array and `join(' ')` at the end, so you never deal with leading, trailing or double spaces.

## Approach

1. `visit(value)`: return on falsy values first; that single check covers `null`, `undefined`, `false`, `0`, `''` and `NaN`.
2. Strings and numbers: push `String(value)`.
3. Arrays: `value.forEach(visit)`.
4. Objects: for each key in `Object.keys(value)` (own, enumerable keys), push it if the value is truthy.
5. Everything else (`true`, functions, symbols) falls through and is ignored.

## Walkthrough

`classNames('btn', { active: true, disabled: false }, ['lg', null, ['rounded']], 0, '')`:

| Argument | Rule | Adds |
| --- | --- | --- |
| `'btn'` | non-empty string | `btn` |
| `{ active: true, disabled: false }` | keys with truthy values | `active` |
| `['lg', null, ['rounded']]` | arrays are visited recursively | `lg`, `rounded` |
| `0`, `''` | falsy values are skipped | – |

Result: `'btn active lg rounded'`.

## Complexity

`O(n)` over all values visited.

## Edge cases to test

- Strings, numbers (non-zero), objects and nested arrays.
- Falsy values skipped, including `0`.
- Order preserved.
- No duplicate removal (unless you add it as an extension).

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

## In the interview

Mention the `dedupe` variant and why libraries like `clsx` exist (performance, size). In React, this is what turns conditional styling into one readable expression.
