**Key idea:** the smallest card left in the hand can only be the **first** card of a group: nothing smaller is left to come before it. So start a group there and remove the next `groupSize − 1` consecutive values. If any is missing, the answer is false. Count copies in a map so each removal is `O(1)`, and process the values in increasing order.

## Recognising the pattern

"Can these be split into groups that follow a rule?" with one forced choice at each step is a greedy from the [Greedy](/problems/patterns/greedy) sheet. The forced choice here is the smallest card; once you see that, there is nothing to search.

## Brute force

Sort the cards, mark them used as you go, and for each smallest unused card scan forward for the next `groupSize − 1` values among the unused ones. That is the reference brute force below. `O(n²)` time because of the scans.

## Greedy with counts

1. If `n` isn't divisible by `groupSize`, return false.
2. Count each value in a map, and sort the cards.
3. For each value `start` in increasing order with `copies = count[start] > 0`:
   - All `copies` of `start` must open their own groups. For each `v` from `start` to `start + groupSize − 1`: if `count[v] < copies`, return false; otherwise subtract `copies`.
4. Return true.

Handling all copies of `start` at once means each distinct value is processed once, rather than once per copy.

**Why the smallest card is forced.** A group containing the smallest card `x` must start at `x` or earlier; nothing earlier is left. So the group is exactly `x, x + 1, …, x + groupSize − 1`. Any valid split must contain that group.

## Walkthrough

`hand = [1, 1, 2, 3]`, `groupSize = 2`: counts `{1: 2, 2: 1, 3: 1}`.

| start | copies | check | counts after |
| --- | --- | --- | --- |
| 1 | 2 | count[1] = 2 ≥ 2, count[2] = 1 < 2 | **fail** |

Answer `false`: both 1s need a 2, and there is only one. For `[5, 1, 3, 2, 4, 6]` with groups of 3, start 1 removes 1, 2, 3, start 4 removes 4, 5, 6, and the answer is `true`.

## Complexity

- Repeated scans: `O(n²)`.
- Counts plus sort: `O(n log n)` for the sort, `O(n · groupSize)` for the removals in the worst case. Space `O(n)`.

## Edge cases

- `groupSize = 1`: always true.
- `n` not divisible by `groupSize`: false immediately.
- Gaps in values (`[1, 2, 4, 5]` with groups of 2): fine, as long as each group is consecutive.

## Common mistakes

- Starting groups from arbitrary cards instead of the smallest remaining.
- Forgetting that several copies of the smallest value each need their own group.
- Removing cards from an array with `indexOf` and `splice`, which is `O(n)` per removal.

## In the interview

- Say why the smallest card is forced; the rest is bookkeeping.
- Likely follow-ups:
  - *Divide Array in Sets of K Consecutive Numbers?* The same problem.
  - *Values streaming in?* Keep the counts in a sorted map (a TreeMap) and always look at its smallest key.
