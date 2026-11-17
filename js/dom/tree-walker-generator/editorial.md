**Key insight:** depth-first and breadth-first are the same loop with a different container. Pop from the end of an array (stack) for DFS, shift from the front (queue) for BFS. A generator turns that loop into a lazy iterator for free: `yield` pauses the loop until the caller asks for the next node.

## Approach

1. Start with `pending = [root]`.
2. While `pending` isn't empty, take a node (`pop` for depth, `shift` for breadth) and call `filter(node)`.
3. `'accept'` → `yield node`. `'reject'` → `continue` without touching its children.
4. Otherwise add its `childNodes`: in reverse for the stack (so the first child is popped first), in order for the queue.

The recursive alternative for DFS is short (`yield node; for (const c of node.childNodes) yield* walk(c, options)`), but each value passes through every level of nested generators, so a deep tree costs O(n × depth) and can exhaust the stack.

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
