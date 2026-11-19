**Key insight:** depth-first and breadth-first are the same loop with a different container. Pop from the end of an array (stack) for DFS, shift from the front (queue) for BFS. A generator turns that loop into a lazy iterator for free: `yield` pauses the loop until the caller asks for the next node.

## Approach

1. Start with `pending = [root]`.
2. While `pending` isn't empty, take a node (`pop` for depth, `shift` for breadth) and call `filter(node)`.
3. `'accept'` → `yield node`. `'reject'` → `continue` without touching its children.
4. Otherwise add its `childNodes`: in reverse for the stack (so the first child is popped first), in order for the queue.

The recursive alternative for DFS is short (`yield node; for (const c of node.childNodes) yield* walk(c, options)`), but each value passes through every level of nested generators, so a deep tree costs O(n × depth) and can exhaust the stack.

## Walkthrough

`[...walk(root, { filter: (n) => (n.nodeName === 'SCRIPT' ? 'reject' : n.nodeType === 1 ? 'accept' : 'skip') })]` on `div > [p > [text], script > [text], span]`:

| Popped | Verdict | Yield? | Children explored? |
| --- | --- | --- | --- |
| div | accept | yes | yes |
| p | accept | yes | yes |
| text (in p) | skip | no | yes (none) |
| script | reject | no | **no** (its subtree is skipped) |
| span | accept | yes | yes |

`'skip'` hides a node but still visits its children; `'reject'` hides the whole subtree, the same semantics as the DOM's `NodeFilter`. As a generator, it produces nodes lazily, so `break` stops the traversal early.

## Complexity

`O(n)` for a full walk; `O(1)` work per yielded node.

## Edge cases to test

- Depth-first order matches document order.
- Breadth-first order level by level.
- `skip` versus `reject`.
- Early `break` stops work.
- Text and comment nodes included unless filtered.

## Pitfalls

- Collecting everything into an array and returning it: the result looks right, but the filter runs for every node before the first value is used.
- Pushing children in order onto a stack: siblings come out reversed.
- Treating `'skip'` like `'reject'` (or the other way round): `skip` only hides the node; `reject` hides the subtree.
- Using `children` instead of `childNodes`: text and comment nodes never appear.
- Storing the queue outside the generator function: two walks then share state.

## Follow-ups interviewers add

- **`whatToShow`:** a bitmask of node types (`SHOW_ELEMENT | SHOW_TEXT`) checked before the filter, like `document.createTreeWalker`.
- **Post-order:** yield a node after its children (needed to delete a tree bottom-up).
- **Mutation during the walk:** what if the caller removes the node you just yielded? Read `childNodes` lazily, or snapshot it.
- **O(1) queue:** replace `shift()` with a head index for very wide trees.
- **Async walk:** an `async function*` that yields per animation frame to keep the page responsive.

## In the interview

Explain generators as lazy iteration and the stack/queue swap between depth- and breadth-first. Mention the native `document.createTreeWalker` and that `shift()` makes this BFS `O(n²)` for huge trees (use an index pointer).
