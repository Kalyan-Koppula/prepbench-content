**Key insight:** build the path bottom-up and let the document tell you when to stop. Each step adds the least information that distinguishes the element from its siblings, and `querySelectorAll(selector).length === 1` says whether the path is already enough.

## Approach

1. Start at `el` with an empty list of steps.
2. If the current element has an `id`, prepend `#id` and stop: ids are unique.
3. Otherwise prepend the lower-case tag. If another element child of the parent has the same tag, add `:nth-child(index + 1)` where `index` is the position in `parent.children`.
4. Join the steps with ` > ` and check `ownerDocument.querySelectorAll(selector).length`. If it's 1, return it; otherwise move to the parent and repeat.

## Walkthrough

For a `<button>` that is the 2nd child of a `<div>` inside `<main id="app">`:

| Step | Selector so far | Unique? |
| --- | --- | --- |
| button (has same-tag siblings) | `button:nth-child(2)` | no |
| add div | `div > button:nth-child(2)` | no |
| reach `main#app` (has an id) | `#app > div > button:nth-child(2)` | yes, stop |

The algorithm builds the shortest path upwards, stopping at an id or as soon as `querySelectorAll` finds exactly one element. `:nth-child` is added only when siblings share the tag, keeping selectors readable.

## Complexity

Up to `O(d)` steps, each running a `querySelectorAll`: `O(d × n)` in the worst case.

## Edge cases to test

- Elements with an id return `#id` directly.
- Only-children don't get `:nth-child`.
- Deep elements without ids.
- The selector resolves back to the same element.
- Ids that need escaping (`CSS.escape(id)` for ids like `1abc` or containing `:`).

## Pitfalls

- Using `:nth-of-type` logic (`n` among same-tag siblings) with `:nth-child`: `<h2><p><p>` makes the second `<p>` `:nth-child(3)`, not 2.
- Counting `childNodes` instead of `children`: whitespace text nodes shift every index.
- Using a descendant space instead of ` > `: `ul p` matches deeper elements too, so the selector can match more than you think.
- Checking uniqueness of the last step alone (`li:nth-child(1)`) instead of the whole path.
- Relying on classes: they toggle with state (`active`, `open`), so the selector stops matching.

## Follow-ups interviewers add

- **Escaping:** ids like `1-item` or `a:b` need `CSS.escape`.
- **Prefer attributes:** testing tools prefer `[data-testid="…"]` over structure. Add a priority list: test id, id, ARIA role/name, then structure.
- **Robustness vs length:** compute several candidates and score them (Chrome DevTools' "Copy selector" does a version of this).
- **Shadow DOM:** a selector can't cross a shadow boundary; return a list of selectors, one per shadow root.

## In the interview

Mention real uses (analytics click tracking, test recorders) and the robustness trade-off: positional selectors break when the page changes, so tools prefer `data-testid` attributes.
