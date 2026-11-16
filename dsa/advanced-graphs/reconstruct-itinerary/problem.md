---
title: Reconstruct Itinerary
difficulty: Hard
order: 8
lists: [neetcode150]
tags: [eulerian-path, hierholzer, dfs]
leetcode: reconstruct-itinerary
function: findItinerary
params:
  - { name: tickets, type: "string[][]" }
returns: "string[]"
hints:
  - Using every ticket exactly once is a path that uses every edge exactly once — an Eulerian path.
  - Greedily taking the alphabetically smallest flight can strand you. Hierholzer's algorithm fixes this — a dead end can only be the final stop, so append airports *after* exhausting their flights, then reverse.
complexity: { time: "O(E log E)", space: "O(E)" }
---

Each entry `tickets[i] = [from, to]` is a one-way flight between two airports, written as three-letter uppercase codes. A traveller departs from `"JFK"` and uses **every** ticket exactly once.

Return the itinerary as the list of airports visited in order. If several itineraries use all tickets, return the one that is smallest when the lists are compared airport by airport in alphabetical order.

## Constraints

- `1 <= tickets.length <= 300`
- `from` and `to` are three uppercase English letters, and `from != to`
- The same ticket may appear more than once.
- At least one itinerary starting at `"JFK"` uses every ticket.
