**Key insight:** selector engines match **right to left**. Test each element against the last compound (cheap and selective), then climb its ancestors to satisfy the rest. With only descendant combinators, greedily taking the nearest matching ancestor is always correct.

## Approach

1. **Parse.** Trim, split on `/\s+/`. Parse each part with a small regex: an optional leading tag or `*`, then any number of `#id` and `.class` tokens. Lower-case the tag.
2. **Match a compound:** tag (if any) equals `tagName.toLowerCase()`, every id equals `el.id`, every class is in `classList`.
3. **Match the full selector:** the element must match the last compound. Then walk `parentElement` upward with a pointer at the previous compound, decrementing the pointer each time an ancestor matches. Success when the pointer passes the first compound.
4. **Collect:** a pre-order walk over `root`'s descendants (not `root`), pushing each element that matches. Pre-order gives document order and no duplicates.

## Walkthrough

`querySelector(root, 'ul.menu li.active')`:

| Step | Detail |
| --- | --- |
| Split on whitespace | compounds `ul.menu` and `li.active` (descendant combinator) |
| Parse each compound | `{ tag: 'ul', classes: ['menu'] }`, `{ tag: 'li', classes: ['active'] }` |
| Candidates | every descendant matching the **last** compound (`li.active`) |
| Check ancestors right to left | walk up from each candidate looking for an ancestor matching `ul.menu` |
| Return | the first candidate in document order that passes |

Matching right to left (from the subject element outwards) is how browsers match selectors too: it rejects most elements after one cheap check.

## Complexity

`O(n × d)` in the worst case: each element, and up to `d` ancestors.

## Edge cases to test

- Tag, id, class and combinations (`a#x.y.z`).
- Descendant chains of several levels.
- No match returns `null`.
- Document order of the first match.
- Ancestors above the root don't count.

## Pitfalls

- Matching left to right from `root` ("find all `nav`, then all `a` inside them") produces duplicates when matches nest and loses document order unless you de-duplicate and sort.
- Stopping the ancestor walk at `root`: native `querySelectorAll` evaluates the selector against the whole document, then filters to `root`'s descendants.
- Substring checks on `className` (`.item` matching `item-list`).
- Comparing `tagName` without lower-casing (`DIV` vs `div`).
- Letting the element itself satisfy an ancestor compound: `.c .c` must not match a lone `.c`. Start the climb at `parentElement`.

## Follow-ups interviewers add

- **Child combinator `>`:** greedy no longer works. `a > b c` needs backtracking: if the nearest `b` ancestor's parent isn't an `a`, try a farther `b`.
- **Selector lists:** `a, b` means union; merge results and keep document order.
- **Attribute selectors and `:not()`:** extend the compound parser into a proper tokenizer.
- **Performance:** index by id/class/tag and start from the rarest part, or cache parsed selectors as browsers do.
- **`matches(el, selector)` and `closest(el, selector)`:** both fall out of `matchesSelector`.

## In the interview

Name what's out of scope (child `>` and sibling combinators, attributes, pseudo-classes) and how you'd add `>`: check only the direct parent for that step.
