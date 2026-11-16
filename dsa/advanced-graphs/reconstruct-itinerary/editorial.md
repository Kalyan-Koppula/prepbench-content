**Key insight:** using every ticket once is an Eulerian path. Hierholzer's algorithm builds one in `O(E)`: walk greedily, and when an airport has no flights left, it must be the **end** of whatever remains — so record airports in post-order and reverse.

## Approach

1. Build `from → destinations`, sorted **descending**, so `pop()` yields the alphabetically smallest next airport.
2. Keep a stack starting with `"JFK"`. While the stack is non-empty: if the top airport still has flights, pop its smallest destination and push it; otherwise pop the airport and append it to `route`.
3. Reverse `route`.

Why greedy + post-order works: if the smallest choice leads into a dead end, that dead end is finalised *first* in `route` (i.e. last in the itinerary), and the walk resumes from the previous airport to use the remaining tickets — they get spliced in before it.

## Complexity

- Time `O(E log E)` — sorting dominates; the walk is `O(E)`.
- Space `O(E)`.

## Alternatives to mention

- **Backtracking:** try destinations in sorted order, undo when stuck; the first complete route is the answer. Correct, but exponential in the worst case.

## Pitfalls

- Pure greedy (always the smallest next airport) fails when that airport is a dead end with tickets still unused.
- Duplicate tickets are separate edges — keep them as separate list entries, not a set.
- Start from `"JFK"`, not from the alphabetically first airport.
