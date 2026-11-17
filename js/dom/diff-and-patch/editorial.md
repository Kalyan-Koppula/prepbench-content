**Key insight:** walk the old and new virtual trees together, one position at a time. At every position there are only four cases (added, removed, replaced, same type), and only the last one recurses.

## Approach

1. Look up the real node: `parent.childNodes[index]`.
2. `oldVNode` undefined → `appendChild(createNode(newVNode))`. `newVNode` undefined → `removeChild(node)`.
3. If the nodes differ in kind (string vs object), in `type`, or are strings with different text → `replaceChild(createNode(newVNode), node)`.
4. Same text → nothing. Same element type → diff props, then children:
   - props in old but not new: `removeAttribute` (or `removeEventListener` with the **old** function);
   - props new or changed: set them; for events, remove the old listener before adding the new one;
   - children: patch the common prefix index by index, remove the extra old children **from the end backwards**, then append the extra new ones.

## Pitfalls

- Removing extra children in a forward loop: after removing index 1, the old index 2 slides into 1, so the loop skips nodes or calls `removeChild(undefined)`.
- Appending by looping `max(old, new)` from the end: additions then come out reversed.
- Calling `addEventListener` with the new handler without removing the old one leaves both firing. You can only remove a listener with the exact function you added, which is why the old vnode's props matter.
- Replacing a node when only its text or attributes changed defeats the point: focus, selection and listeners on that node are lost.
- Comparing vnodes with `===` and skipping the subtree: a new object with the same content still needs to be diffed (and an equal object reference can be skipped, which is a fair optimization to mention).

## Follow-ups interviewers add

- **Keyed children:** with `key` props, match old and new children by key so inserting at the start moves nodes instead of patching every row. Build a `key → old node` map, then reorder with `insertBefore`.
- **Minimise moves:** React-style "last placed index", or Vue/Inferno's longest increasing subsequence.
- **Event delegation:** store handlers on the node (e.g. `el.__handlers`) and attach one listener per event type at the root.
- **Return value:** have `patch` return the new real node so callers can keep references up to date.
- **Batching:** collect patches first (diff phase), then apply them together (commit phase).
