**Key insight:** it's a pre-order walk over element children with a tag predicate. Lower-case both sides once, because `tagName` is `"LI"` for HTML elements.

## Approach

1. Lower-case `tagName`. The predicate is "always true" for `*`, otherwise `el.tagName.toLowerCase() === wanted`.
2. Start from the root's `children` so the root is excluded.
3. Recursive version: test each child, then recurse into it.
4. Iterative version (the reference solution): a stack seeded with the root's children in reverse. Pop, test, push the popped element's children in reverse. Reversing keeps document order.

## Pitfalls

- Comparing `el.tagName === 'li'` fails because HTML `tagName` is upper-case. `localName` is lower-case but doesn't help if the caller passes `'LI'`.
- Using `childNodes` and calling `tagName` on text nodes gives `undefined.toLowerCase()`.
- With an explicit stack, forgetting to reverse the children gives reverse document order within each level.
- Using a queue (shift) instead of a stack gives breadth-first order, which is not document order.

## Follow-ups interviewers add

- **Namespaces:** SVG `tagName`s keep their case (`foreignObject`). What changes?
- **Combine with the class lookup:** write one `walk(root, predicate)` and build both functions on top of it.
- **Limit:** return only the first N matches and stop walking early.
- **Generator:** yield matches lazily so a caller can stop after the first one.
