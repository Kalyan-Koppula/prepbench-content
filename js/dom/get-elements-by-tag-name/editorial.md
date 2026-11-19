**Key insight:** it's a pre-order walk over element children with a tag predicate. Lower-case both sides once, because `tagName` is `"LI"` for HTML elements.

## Approach

1. Lower-case `tagName`. The predicate is "always true" for `*`, otherwise `el.tagName.toLowerCase() === wanted`.
2. Start from the root's `children` so the root is excluded.
3. Recursive version: test each child, then recurse into it.
4. Iterative version (the reference solution): a stack seeded with the root's children in reverse. Pop, test, push the popped element's children in reverse. Reversing keeps document order.

## Walkthrough

`getElementsByTagName(root, 'li')` on `<ul id="root"><li>1<ul><li>1.1</li></ul></li><li>2</li></ul>`:

| Stack (top last) | Popped | Match? | Result |
| --- | --- | --- | --- |
| [li₂, li₁] | li₁ | yes | [li₁] |
| [li₂, ul] | ul | no | |
| [li₂, li₁.₁] | li₁.₁ | yes | [li₁, li₁.₁] |
| [li₂] | li₂ | yes | [li₁, li₁.₁, li₂] |

Children are pushed in reverse so they pop in document order: the result matches `querySelectorAll` order (depth-first, pre-order). The root itself isn't included.

## Complexity

`O(n)` elements visited.

## Edge cases to test

- Case-insensitive tag matching.
- `'*'` matches every descendant.
- Document order of results.
- The root isn't included even if it matches.

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

## In the interview

Explain the reverse push for document order. Note that the native method returns a **live** `HTMLCollection`, which this static array doesn't reproduce.
