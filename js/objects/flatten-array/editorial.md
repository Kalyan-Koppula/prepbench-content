**Key insight:** each item is either spread (it's an array and depth remains) or pushed. Carry the remaining depth down the recursion and push into one shared output array.

## Approach

1. `walk(items, remaining)`: for each item, if `Array.isArray(item) && remaining > 0`, call `walk(item, remaining - 1)`; else push it.
2. Start with `walk(array, depth)`. `Infinity - 1 === Infinity`, so "flatten everything" needs no special case, and a depth of `0` or less pushes items as they are.
3. Iterate with `forEach` (or `for` plus `i in items`) so holes are skipped like `.flat()` does.

## Pitfalls

- `for...of` and `for (let i...)` visit holes as `undefined`, so the result gets extra items.
- `[].concat(...items)` only goes one level and copies holes.
- Checking `item.length !== undefined` or `typeof item === 'object'` flattens strings, array-likes and `arguments`.
- `reduce((acc, x) => acc.concat(...))` allocates a new array per item: O(n²) on big inputs.

## Follow-ups interviewers add

- **Iterative version:** keep a stack of `[item, depth]` pairs. Push the input's items in reverse, pop one at a time; arrays with depth left push their children (reversed) with `depth - 1`, values go to the output. No recursion, so 100 000 levels of nesting can't overflow the call stack. Interviewers often ask for this right after the recursive one.
- **Generator version:** `function* flattenIter(array, depth)` with `yield*`, which works lazily on huge inputs.
- **Polyfill `Array.prototype.flat`**, including the `this` handling and holes rule.
- **Typed version:** a `Flatten<T, Depth>` type.
