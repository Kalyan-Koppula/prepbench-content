**Key insight:** it's plain level order — keep traversing left to right and just reverse the recorded values on every other level.

## Approach

1. Run BFS one level at a time, always pushing children left then right.
2. Collect the level's values; if the level index is odd, reverse them before appending.

## Complexity

- Time `O(n)` — reversing a level costs its length, which sums to `n`.
- Space `O(n)` for the output and the current level.

## Alternatives to mention

- Write values into a pre-sized array at index `i` or `size - 1 - i` depending on direction — avoids the reverse call.
- A deque (or two stacks) that alternates pushing children right-left / left-right — the classic textbook version, but easier to get wrong.

## Pitfalls

- Reversing the *order you enqueue children* instead of the order you record values scrambles the next level.
