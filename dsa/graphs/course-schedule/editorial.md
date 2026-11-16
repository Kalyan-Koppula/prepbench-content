**Key insight:** all courses can be finished exactly when the prerequisite graph (edge `b → a`) has no directed cycle. Kahn's algorithm detects that by counting how many nodes it can peel off.

## Approach (Kahn's algorithm)

1. Build adjacency lists `b → a` and an `indegree` count for every course.
2. Start a queue with every course whose indegree is `0` — no prerequisites.
3. Pop a course, count it as taken, and decrement the indegree of each course that depends on it; push any that reach `0`.
4. Return `taken === numCourses`. Courses on (or behind) a cycle never reach indegree `0`.

## Complexity

- Time `O(V + E)` — each course and each edge is processed once.
- Space `O(V + E)` — adjacency lists and the queue.

## Alternatives to mention

- **DFS with three colours:** white = unvisited, grey = on the current path, black = done. Reaching a grey node means a back edge, i.e. a cycle. Same complexity; recursion depth can reach `V`.
- Plain "visited" DFS is wrong for directed graphs: a node reached twice via different paths (a diamond) isn't a cycle.

## Pitfalls

- Edge direction: `[a, b]` means `b` first, so the edge is `b → a`.
- Courses with no edges at all still count toward `numCourses`.
