**Key insight:** split every update into two phases. A write only **marks** the graph (direct dependents `DIRTY`, everything further down `CHECK`) and queues the effects it reaches. Then each queued effect **pulls**: a `CHECK` node asks its sources to bring themselves up to date first, and reruns only if one of them really changed. Pushing marks and pulling values is what makes the diamond case glitch-free and lets equal results stop the wave.

## Approach

1. One node type for signals, computeds and effects: `value`, `state`, `sources` (what it read), `observers` (who read it).
2. A global `current` node. `read()` links `current <-> this` and then calls `updateIfNecessary()` (a no-op for signals).
3. `write(v)`: bail on `Object.is`; set the value; `mark(DIRTY)` each observer; flush the effect queue.
4. `mark(state)`: raise the node's state; if it was `CLEAN` and is an effect, queue it; propagate `CHECK` to its observers.
5. `updateIfNecessary()`: if `CHECK`, update sources in order until one of them flips us to `DIRTY`; if `DIRTY`, `update()`; then `CLEAN`.
6. `update()`: unlink from old sources, rerun `fn` with `current = this` (which records fresh, dynamic dependencies), and if the value changed, set direct observers to `DIRTY`.
7. `effect` creates a `DIRTY` effect node and updates it once; disposing unlinks it and flags it so a queued run is skipped.

## Walkthrough

```js
const price = signal(10)
const qty = signal(2)
const total = computed(() => price.value * qty.value)
effect(() => console.log('total', total.value))
price.value = 12
```

| Step | What happens |
| --- | --- |
| 1 | `effect` runs immediately: reads `total`, which computes 20 and records `price` and `qty` as its sources; logs `total 20` |
| 2 | `price.value = 12` marks `total` dirty and the effect as "check" |
| 3 | The effect asks its sources whether they changed: `total` recomputes to 24, which differs, so the effect reruns |
| 4 | Logs `total 24` |

Dependencies are tracked automatically by **reading** values during a computation. Updates are pushed as dirty flags and pulled lazily, so a computed value that nobody reads never recomputes, and a computed that recomputes to the same value doesn't rerun its observers.

## Complexity

Each change visits the affected part of the dependency graph once; unaffected nodes cost nothing.

## Edge cases to test

- Computed values update when sources change.
- Effects run once per change, after all sources settle (no "glitches" with intermediate values).
- Unread computeds stay lazy.
- Dependencies change dynamically (a conditional read).
- Disposing an effect stops it.

## Pitfalls

- **Eager push:** rerunning dependents directly from `write` makes the diamond effect run twice, once with a fresh `b` and a stale `c` (a "glitch").
- Never unlinking old sources: after `useA` flips, writes to `a` still rerun the effect.
- Recomputing a computed on every read, or on every write even when nobody reads it.
- Forgetting the equality cut-off, so `parity` staying `'even'` still reruns everything downstream.
- Restoring `current` without `try/finally`: one throwing computed corrupts tracking for everything after it.

## Follow-ups interviewers add

- **`batch(fn)`:** several writes, one flush.
- **Effect cleanup:** let `fn` return a cleanup that runs before the next run and on dispose (like `useEffect`).
- **`untracked(fn)` / `peek()`:** read without subscribing.
- **Memory:** a computed nobody reads still holds links to its sources. How do libraries avoid leaking (unlinking when the last observer goes away)?
- **Compare with React:** React rerenders components and diffs; signals update exactly the reads that changed. What are the trade-offs?

## In the interview

Explain push-then-pull and why it avoids glitches. Connect it to frameworks: Solid, Preact Signals, Vue's reactivity, Angular signals, and the TC39 signals proposal.
