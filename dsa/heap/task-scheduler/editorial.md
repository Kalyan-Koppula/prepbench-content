**Key idea:** the label with the most copies left is the one most likely to cause idle time later, so run it whenever you can. Simulate with a max-heap of remaining counts for labels that can run now, and a queue of labels cooling down with the time they become available. Jump the clock forward when nothing can run.

## Recognising the pattern

"Pick the best available item, use it, and put it back later" is a greedy simulation with a heap from the [Heap](/problems/patterns/heap) sheet. The cooldown adds a second structure: a queue, since labels leave cooldown in the order they entered it.

There is also a closed-form answer, worth knowing as the follow-up.

## Brute force

Simulate one time unit at a time: scan all 26 labels, pick the one with the most copies left among those whose cooldown has expired, or stay idle. That is the reference brute force below. Each unit costs `O(26)`, and the total time can be up to about `tasks × (n + 1)` units.

## Optimal: heap of counts plus a cooldown queue

1. Count each label. Push every non-zero count into a max-heap `ready`.
2. Keep a queue `cooling` of `(count left, time available)`.
3. While `ready` or `cooling` has something:
   1. If `ready` is empty, set `time` to the next release time in `cooling` (skip all idle units at once).
   2. Otherwise `time++`, pop the largest count, decrement it, and if copies remain, add `(count, time + n)` to `cooling`.
   3. If the front of `cooling` is released at `time`, move it back to `ready`.
4. Return `time`.

Because every label waits exactly `n` units, the queue stays ordered by release time.

**The formula.** Let `maxCount` be the highest count and `numMax` the number of labels with that count. The most frequent label forces `maxCount − 1` full blocks of length `n + 1`, followed by one last row with the `numMax` most frequent labels: `(maxCount − 1) · (n + 1) + numMax`. If there are so many different tasks that no idling is ever needed, the answer is simply `tasks.length`. The answer is the larger of the two.

## Walkthrough

`tasks = [A, A, A, B, B, B]`, `n = 2`

| time | ran | ready after | cooling (count, until) |
| --- | --- | --- | --- |
| 1 | A | B:3 | A:2 until 3 |
| 2 | B | – | A:2@3, B:2@4 |
| 3 | idle (jump) | A:2 released | B:2@4 |
| 4 | A | B:2 released | A:1@6 |
| 5 | B | – | A:1@6, B:1@7 |
| 6 | idle (jump) | A:1 released | B:1@7 |
| 7 | A | B:1 released | – |
| 8 | B | – | – |

The schedule is `A B idle A B idle A B`, 8 units. The formula agrees: `(3 − 1) · 3 + 2 = 8`.

## Complexity

- Unit-by-unit simulation: `O(26 · total time)`.
- Heap simulation: `O(T log 26)` for `T` tasks, which is `O(T)`. Space `O(26)`.
- Formula: `O(T)` to count, `O(1)` extra space.

## Edge cases

- `n = 0`: no idling; the answer is the number of tasks.
- One label only: `(count − 1) · (n + 1) + 1`.
- Many distinct labels: no idle time; the answer is `tasks.length`.

## Common mistakes

- Running labels in a fixed alphabetical cycle instead of most-remaining first.
- Counting cooldown as `n − 1` or `n + 1` units by mistake: after running at time `t`, the label can run at `t + n + 1`.
- Forgetting the `max(…, tasks.length)` in the formula.

## In the interview

- Explain why "most remaining first" is the right greedy choice, then code the simulation or derive the formula.
- Likely follow-ups:
  - *Return the schedule?* The simulation produces it.
  - *Tasks must run in the given order (Task Scheduler II)?* A different, simpler simulation with a map of next allowed times.
