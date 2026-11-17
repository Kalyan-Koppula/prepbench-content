**Key insight:** both helpers are about **existence**, so use `hasOwnProperty` everywhere. Deep `pick` builds a new skeleton; deep `omit` copies the path down to the removed key and reuses everything else.

## Approach

**pick:** for each path, first walk the source with own-property checks. If any step is missing, skip the path. Otherwise walk again, creating (or reusing) objects in the result for every step but the last, and copy the final value.

**omit:** start from `{ ...obj }` (own enumerable keys only), then remove each path with a recursive helper that returns the object unchanged when the path doesn't exist, and a copy with the child replaced when it does.

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
