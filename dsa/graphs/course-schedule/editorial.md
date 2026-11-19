**Key idea:** courses and prerequisites form a directed graph, and every course can be finished exactly when that graph has **no cycle**. Kahn's algorithm checks this directly: repeatedly take a course with no unmet prerequisites and remove it. If every course gets taken, there is no cycle; if some never become available, they are stuck in one.

## Recognising the pattern

Dependencies with "must come before" are a directed graph, and "can everything be ordered?" is the topological sort question from the [Graphs](/problems/patterns/graphs) sheet. Either Kahn's algorithm (BFS on in-degrees) or DFS cycle detection answers it.

## Alternative: DFS cycle detection (shown below)

Colour each course: new, on the current DFS path, or finished. DFS from every new course. Reaching a course that is on the current path means a cycle. That is the reference brute force below; it is equally efficient, `O(V + E)`, and many interviewers expect it.

## Kahn's algorithm

1. Build `unlocks[pre]`, the courses that list `pre` as a prerequisite, and `missing[course]`, the number of unmet prerequisites.
2. Put every course with `missing == 0` in a list of ready courses.
3. While there are ready courses: take one, count it as taken, and for each course it unlocks, decrement `missing`; when it reaches 0, that course becomes ready.
4. Return `taken == numCourses`.

**Why leftover courses mean a cycle.** If a course is never taken, at least one of its prerequisites was never taken either, and following those back must eventually repeat a course, since there are finitely many. That repetition is a cycle.

## Walkthrough

`numCourses = 4`, `prerequisites = [[1, 0], [2, 1], [3, 2]]` (0 → 1 → 2 → 3)

| ready | take | unlocked | missing after |
| --- | --- | --- | --- |
| 0 | 0 | 1 | 1:0, 2:1, 3:1 |
| 1 | 1 | 2 | 2:0 |
| 2 | 2 | 3 | 3:0 |
| 3 | 3 | – | |

Four taken: `true`. Adding `[0, 3]` makes a cycle: no course starts with `missing == 0`, nothing is taken, and the answer is `false`.

## Complexity

- Both approaches: time `O(V + E)` for `V` courses and `E` prerequisites. Space `O(V + E)` for the graph.

## Edge cases

- No prerequisites: everything is ready immediately.
- A course depending on itself (not allowed here) would be a cycle of length 1.
- Several disconnected groups: Kahn's handles them all in one pass.

## Common mistakes

- Reversing the edge direction (`[a, b]` means `b` before `a`).
- In DFS, using only "visited/unvisited", which reports false cycles when two paths reach the same finished course.
- Counting taken courses wrongly when a course is added to the ready list twice.

## In the interview

- Name both approaches and pick one. Mention that Kahn's also produces an order for free.
- Likely follow-ups:
  - *Return the order?* Record courses as they are taken (Course Schedule II).
  - *Minimum number of semesters?* Kahn's in levels: each level is one semester.
  - *Detect which courses are in a cycle?* The ones never taken.
