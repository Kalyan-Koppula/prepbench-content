**Key insight:** merge **into a fresh result**, never into a source. If every plain object in the result was created by you, you can recurse into it freely, and the inputs are safe by construction.

## Approach

1. `result = {}`; for each non-null source, `mergeInto(result, source)`.
2. For each own key of the source: skip unsafe keys and `undefined` values.
3. If the incoming value is a plain object, recurse into the existing value when it is also a plain object (it is one of yours), otherwise into a new `{}`. Assign the returned object.
4. Anything else (primitive, `null`, array, Date, instance, function) replaces the existing value.

## Walkthrough

`deepMerge({ theme: { color: 'blue', size: 12 } }, { theme: { size: 14 }, debug: true })`:

| Key path | Existing | Incoming | Result |
| --- | --- | --- | --- |
| `theme` | object | object | merge recursively |
| `theme.color` | `'blue'` | – | kept |
| `theme.size` | 12 | 14 | 14 (later source wins) |
| `debug` | – | `true` | added |

Result: `{ theme: { color: 'blue', size: 14 }, debug: true }`. Arrays and other non-plain values are **replaced**, not merged, and `undefined` in a source doesn't overwrite. Keys like `__proto__` are skipped so a malicious JSON payload can't pollute `Object.prototype`.

## Complexity

`O(n)` for the total number of keys across sources.

## Edge cases to test

- Nested merges at several levels.
- Later sources override earlier ones.
- Arrays replace rather than concatenate.
- `undefined` values don't overwrite.
- Inputs aren't mutated.
- A `__proto__` key in parsed JSON doesn't change prototypes.

## Pitfalls

- `Object.assign(target, ...)` or `{ ...a, ...b }` is shallow: `theme` from `b` replaces `theme` from `a` wholesale.
- Merging into the first source mutates the caller's defaults; the next merge then starts from polluted defaults.
- Recursing whenever `typeof x === 'object'` treats arrays as objects (`['git', 'lint']` + `['vim']` becomes `['vim', 'lint']`) and mutates `Date`s and class instances.
- **Prototype pollution:** `JSON.parse('{"__proto__": {...}}')` creates an own key named `__proto__`. Reading `target['__proto__']` then returns `Object.prototype`, and a naive merge writes into it, affecting every object in the app. `{"constructor": {"prototype": ...}}` reaches the same place through `({}).constructor === Object`.

## Follow-ups interviewers add

- **Custom array strategy:** concatenate, merge by index, or merge by an `id` field; take a `customizer(key, a, b)` callback.
- **Cycles in sources:** track visited pairs.
- **Typed signature:** `deepMerge<A, B>(a: A, b: B): DeepMerge<A, B>` as a type challenge.
- **Mutating version** (lodash `merge`) vs this pure one: when is each appropriate?

## In the interview

Clarify the array policy (replace, concatenate or merge by index) up front. Then raise prototype pollution unprompted; it's the security question hiding inside this exercise.
