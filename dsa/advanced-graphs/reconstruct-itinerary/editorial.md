**Key idea:** using every ticket exactly once is an **Eulerian path** through the airports. Hierholzer's algorithm builds it: keep flying along unused tickets, always choosing the alphabetically smallest destination, and when you reach an airport with no tickets left, it belongs at the **end** of the remaining route. Collect airports in that order and reverse.

## Recognising the pattern

"Use every edge exactly once" is the Eulerian-path question from the [Advanced Graphs](/problems/patterns/advanced-graphs) sheet. A greedy walk alone can get stuck early in a dead end; Hierholzer's post-order collection fixes that automatically.

## Brute force

Backtracking: from the current airport, try unused tickets in alphabetical order of destination; if the route gets stuck before using every ticket, undo and try the next. The first complete route is the smallest. That is the reference brute force below. Correct, but exponential in the worst case.

## Hierholzer's algorithm

1. Map each airport to its destinations, sorted so the smallest can be taken first (sorted descending and popped from the end, for `O(1)` removal).
2. Stack = `["JFK"]`, route = `[]`.
3. While the stack isn't empty:
   1. If the airport on top still has tickets, take the smallest destination and push it.
   2. Otherwise pop the airport and append it to `route`.
4. Return `route` reversed.

**Why dead ends go last.** An airport is popped only when all its tickets are used. If the greedy walk enters a dead end early (say, a one-way trip to `KUL` with nothing after it), that dead end can only be the **final** stop of the whole itinerary. Appending it first to `route` and reversing at the end puts it there, while the walk backs up and uses the remaining tickets.

## Walkthrough

`tickets = [["JFK","KUL"], ["JFK","NRT"], ["NRT","JFK"]]`

| stack | action | route |
| --- | --- | --- |
| JFK | take KUL (smaller than NRT) | |
| JFK, KUL | KUL has no tickets: pop | KUL |
| JFK | take NRT | KUL |
| JFK, NRT | take JFK | KUL |
| JFK, NRT, JFK | no tickets left: pop all | KUL, JFK, NRT, JFK |

Reversed: `["JFK", "NRT", "JFK", "KUL"]`. A purely greedy walk would have flown to `KUL` first and got stuck.

## Complexity

- Backtracking: exponential in the worst case.
- Hierholzer: time `O(E log E)` for sorting the destinations, then `O(E)` for the walk. Space `O(E)`.

## Edge cases

- Duplicate tickets: they appear twice in the destination list and are used twice.
- A single ticket: `[JFK, destination]`.
- Several valid itineraries: the smallest destination is always tried first, which yields the lexicographically smallest.

## Common mistakes

- A plain greedy walk that adds airports in visiting order.
- Removing tickets from the front of an array (`O(n)` per removal) instead of the end.
- Forgetting to reverse the route.

## In the interview

- Name Eulerian paths and explain why dead ends are appended first.
- Likely follow-ups:
  - *Does an Eulerian path exist?* In a directed graph: at most one node with out-degree − in-degree = 1 (the start), at most one with −1 (the end), all others balanced, and the edges connected.
  - *Valid arrangement of pairs?* The same algorithm with the start node chosen by degrees.
