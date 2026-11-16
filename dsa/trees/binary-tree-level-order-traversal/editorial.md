**Key insight:** BFS already visits nodes level by level; the only extra work is knowing where one level ends — snapshot the queue's size (or build the next level in a fresh array).

## Approach

1. Start with `level = [root]` (or `[]` for an empty tree).
2. While `level` is non-empty: record its values, then collect every non-null child (left before right) into `next`.
3. Replace `level` with `next`.

Building a fresh array per level avoids `queue.shift()`, which is `O(n)` in JS.

## Complexity

- Time `O(n)` — each node enters and leaves a level once.
- Space `O(n)` — the output, plus up to `O(w)` for the widest level (about `n/2` in a full tree).

## Alternatives to mention

- DFS with a `depth` argument: `out[depth] ??= []; out[depth].push(val)`, visiting left before right. Same output, `O(h)` stack instead of a queue.

## Follow-ups

- Bottom-up order (reverse the result), zigzag, right-side view, level averages, and max width are all small edits to this loop.
