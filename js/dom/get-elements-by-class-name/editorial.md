**Key insight:** this is a pre-order depth-first walk over `children` with a predicate. Parse the class list once, then an element matches when `classList.contains` is true for every wanted name.

## Approach

1. Split `classNames` on `/\s+/` and drop empty strings. No names means no matches.
2. Recursively visit each element's `children`. For each child, test it first, then descend, which yields document order.
3. Start from the root's children so the root itself is never tested.
4. Collect into a plain array.

## Walkthrough

`getElementsByClassName(root, 'btn primary')` checks every descendant for **all** listed classes:

| Element | Classes | All of `btn`, `primary`? |
| --- | --- | --- |
| `button.btn.primary` | btn, primary | yes |
| `button.btn` | btn | no |
| `a.primary.btn.large` | primary, btn, large | yes (order and extras don't matter) |

Whitespace in the argument is normalised, so `'  btn   primary '` behaves the same.

## Complexity

`O(n × k)` for `n` elements and `k` class names (each `classList.contains` is fast).

## Edge cases to test

- Multiple classes in any order.
- Extra whitespace.
- Empty string returns `[]`.
- Document order; the root excluded.

## Pitfalls

- Using `className.includes('btn')` matches `btn-primary` and `mybtn`. Compare tokens with `classList.contains` (or split `className`).
- `'a  b'.split(' ')` produces an empty string, and `classList.contains('')` is false, so nothing ever matches. Split on `/\s+/` and filter.
- Walking `childNodes` without checking `nodeType` hands text nodes to code that expects `classList`.
- Checking the root before its children includes the root, which the native method never does.
- Descending first and checking after (post-order) puts children before their parents.

## Follow-ups interviewers add

- **Live collection:** the native method returns an `HTMLCollection` that updates as the DOM changes. How would you fake that? (A getter that re-runs the walk, or a `MutationObserver` to invalidate a cache.)
- **Iterative version:** use an explicit stack, pushing children in reverse so they pop in order, to avoid deep recursion.
- **`getElementsByTagName` / `querySelectorAll('.a.b')`:** reuse the same walker with a different predicate.
- **Performance:** what if this runs on every keystroke over a 50k-node tree? Discuss indexing by class or narrowing the subtree.

## In the interview

Mention that `classList.contains` is case-sensitive (in standards mode), that the native result is live, and that `querySelectorAll('.btn.primary')` is the modern equivalent.
