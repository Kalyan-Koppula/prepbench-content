**Key insight:** merge **into a fresh result**, never into a source. If every plain object in the result was created by you, you can recurse into it freely, and the inputs are safe by construction.

## Approach

1. `result = {}`; for each non-null source, `mergeInto(result, source)`.
2. For each own key of the source: skip unsafe keys and `undefined` values.
3. If the incoming value is a plain object, recurse into the existing value when it is also a plain object (it is one of yours), otherwise into a new `{}`. Assign the returned object.
4. Anything else (primitive, `null`, array, Date, instance, function) replaces the existing value.

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
