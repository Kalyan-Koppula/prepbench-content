**Key insight:** this is topological sort. Kahn's algorithm emits courses in exactly the order their prerequisites are satisfied — that sequence is the answer, and a short sequence means a cycle.

## Approach

1. Build `b → a` adjacency lists and indegrees.
2. Queue every course with indegree `0`.
3. Pop a course, append it to `order`, decrement its dependants' indegrees, and enqueue any that hit `0`.
4. Return `order` if it has `numCourses` entries, otherwise `[]`.

## Complexity

- Time `O(V + E)`.
- Space `O(V + E)`.

## Alternatives to mention

- **DFS post-order:** run a three-colour DFS; append each course *after* all courses it unlocks are finished, then reverse the list. A grey-node hit means a cycle → `[]`.
- If the interviewer wants the lexicographically smallest order, swap the queue for a min-heap: `O(E + V log V)`.

## Pitfalls

- Returning a partial order when there is a cycle — check the length.
- Forgetting isolated courses: they have indegree `0` and must still appear.
- Getting the edge direction backwards produces the reverse of a valid order.
