**Key insight:** both helpers are about **existence**, so use `hasOwnProperty` everywhere. Deep `pick` builds a new skeleton; deep `omit` copies the path down to the removed key and reuses everything else.

## Approach

**pick:** for each path, first walk the source with own-property checks. If any step is missing, skip the path. Otherwise walk again, creating (or reusing) objects in the result for every step but the last, and copy the final value.

**omit:** start from `{ ...obj }` (own enumerable keys only), then remove each path with a recursive helper that returns the object unchanged when the path doesn't exist, and a copy with the child replaced when it does.

## Walkthrough

`pick({ id: 1, profile: { name: 'Ana', email: 'a@x' }, role: 'admin' }, ['id', 'profile.name', 'missing'])`:

| Path | Found? | Result after |
| --- | --- | --- |
| `id` | yes | `{ id: 1 }` |
| `profile.name` | yes | `{ id: 1, profile: { name: 'Ana' } }` |
| `missing` | no | unchanged (no `missing: undefined` key) |

`omit` is the complement: copy along the paths and leave out the named ones, without mutating the original.

## Complexity

`O(k × d)` for `k` paths of depth `d`, plus copying.

## Edge cases to test

- Top-level and nested paths.
- Missing paths leave no trace.
- `omit` doesn't mutate the input.
- Keys inherited from the prototype aren't picked.

## Pitfalls

- `if (obj[key] !== undefined)` drops own keys set to `undefined`; `key in obj` picks up inherited ones, including `toString`.
- Creating parent objects before checking the full path: `pick(user, ['profile.avatar'])` leaves an empty `profile: {}`.
- `const copy = { ...obj }; delete copy.profile.secret` deletes from the **original** nested object, because the spread is shallow.
- `for...in` without an own-property check copies inherited properties into `omit`'s result.

## Follow-ups interviewers add

- **Predicate versions:** `pickBy(obj, (value, key) => ...)` and `omitBy`.
- **Array paths** like `items.0.price`, and wildcards like `items.*.price`.
- **Types:** write `pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K>`, then try typing dot paths.
- **Where this shows up:** stripping secrets before logging, picking fields for an API payload, `omit(props, ['children'])` in React wrappers.

## In the interview

Mention when this shows up: shaping API responses, removing sensitive fields before logging (`omit(user, ['password'])`), and why an allow-list (`pick`) is safer than a deny-list for public output.
