**Key insight:** history is two stacks around a present value. Undo pops from `past` and pushes the present onto `future`; redo is the mirror image; a new push throws `future` away.

## Approach

1. `past: T[]`, `present: T`, `future: T[]`.
2. `push(next)`: ignore if `Object.is(next, present)`. Otherwise push `present` to `past`, trim `past` from the front to `limit`, set `present = next`, clear `future`.
3. `undo()`: if `past` is non-empty, `future.push(present)` and `present = past.pop()`. Return `present`.
4. `redo()`: the same with the stacks swapped.

## Walkthrough

```js
const h = new History('a')
h.push('b'); h.push('c')
h.undo()      // 'b'
h.undo()      // 'a'
h.redo()      // 'b'
h.push('x')   // the redo stack is cleared
h.redo()      // 'x' (nothing to redo)
```

| Step | past | present | future |
| --- | --- | --- | --- |
| start | [] | a | [] |
| push b, push c | [a, b] | c | [] |
| undo | [a] | b | [c] |
| undo | [] | a | [c, b] |
| redo | [a] | b | [c] |
| push x | [a, b] | x | [] |

A new change after undoing starts a new branch of history, so the old future is discarded. A `limit` drops the oldest entries from `past`.

## Complexity

`O(1)` per operation (amortised; trimming to a limit is `O(1)` per push when exceeding by one).

## Edge cases to test

- Undo and redo at the boundaries (nothing happens).
- New pushes clear the future.
- Pushing the same value is ignored.
- The history limit.
- `canUndo` and `canRedo` flags.

## Pitfalls

- A single array plus an index is fine too, but then "branching" means truncating the array after the index; forgetting that lets redo resurrect a discarded branch.
- Clearing redo on an ignored (same-value) push.
- Applying the limit to the **total** number of entries instead of undo steps is an off-by-one.
- Storing mutable objects and then mutating the present in place: every history entry points at the same object. History only works with immutable updates.

## Follow-ups interviewers add

- **Coalescing:** typing "hello" should be one undo step, not five. Group pushes that arrive within N ms (combine with debounce) or share a `groupId`.
- **Commands instead of snapshots:** store `{ do, undo }` operations for large documents where snapshots are too expensive.
- **React hook:** `useHistory(initial)` returning `[value, { set, undo, redo, canUndo, canRedo }]`, with `Ctrl+Z` / `Ctrl+Shift+Z` bindings.
- **Persisting** history across reloads, and what to do with a limit when restoring.

## In the interview

Discuss storing snapshots (simple, memory-heavy) versus commands or patches (compact, need inverse operations), and coalescing rapid changes (typing) into one undo step.
