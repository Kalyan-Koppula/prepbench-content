**Key idea:** the order in which Kahn's algorithm takes courses is a valid schedule. Start with every course that has no prerequisites, and each time a course is taken, release the courses for which it was the last missing prerequisite. If all courses get taken, return that order; otherwise there is a cycle, and the answer is empty.

## Recognising the pattern

Producing an order that respects "must come before" constraints is **topological sorting**, from the [Graphs](/problems/patterns/graphs) sheet. It is Course Schedule with the taken courses recorded.

## Alternative: DFS post-order (shown below)

DFS from each course with three colours. When a course finishes (everything that depends on it has been explored), append it to a list. Reversing that list gives a valid order, because every course finishes after all courses reachable from it. Finding a course already on the current path means a cycle: return `[]`. That is the reference brute force below.

## Kahn's algorithm

1. Build `unlocks` and `missing` as in Course Schedule.
2. Put every course with `missing == 0` into `order`. Use `order` itself as the queue, with a `head` index.
3. While `head < order.length`: take `order[head]`, advance `head`, and for each unlocked course, decrement `missing`; if it reaches 0, append it to `order`.
4. Return `order` if it contains every course, otherwise `[]`.

Using the result array as the queue avoids a second structure: everything appended is, by construction, ready.

## Walkthrough

`numCourses = 4`, `prerequisites = [[1, 0], [2, 0], [3, 1], [3, 2]]`

| order so far | take | missing changes | appended |
| --- | --- | --- | --- |
| [0] | 0 | 1:0, 2:0 | 1, 2 |
| [0, 1, 2] | 1 | 3:1 | – |
| [0, 1, 2] | 2 | 3:0 | 3 |
| [0, 1, 2, 3] | 3 | – | – |

Answer `[0, 1, 2, 3]` (`[0, 2, 1, 3]` would also be accepted).

## Complexity

- Both approaches: time `O(V + E)`, space `O(V + E)`.

## Edge cases

- No prerequisites: any order of all courses; Kahn's returns them in label order.
- A cycle anywhere: return `[]`, even if most courses could be ordered.
- A single course: `[0]`.

## Common mistakes

- Returning a partial order when there is a cycle.
- Building edges in the wrong direction, which produces the reverse order.
- Forgetting to reverse the DFS post-order.

## In the interview

- Explain that any order Kahn's produces is valid, and that several valid answers exist.
- Likely follow-ups:
  - *The lexicographically smallest order?* Use a min-heap instead of a queue for the ready courses.
  - *Alien Dictionary?* Build the letter graph from adjacent words, then the same topological sort.
