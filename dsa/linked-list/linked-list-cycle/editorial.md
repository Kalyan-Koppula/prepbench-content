**Key insight (Floyd's tortoise and hare):** move `slow` one step and `fast` two steps. Without a cycle, `fast` hits `null`. With one, both end up inside the loop and `fast` gains one node per step, so it must land on `slow`.

## Approach

1. `slow = fast = head`.
2. While `fast && fast.next`: advance `slow` by one and `fast` by two. If `slow === fast`, return `true`.
3. Loop exits → `fast` reached the end → return `false`.

Compare node **identity** (`===`), not values — values can repeat.

## Complexity

- Time `O(n)` — once both are in the cycle, the gap closes within one lap.
- Space `O(1)`.

## Alternatives to mention

- `Set<ListNode>` of visited nodes: `O(n)` time and space. Simple and fine as an opener.

## Follow-ups

- **Where does the cycle start?** (Linked List Cycle II) After they meet, reset one pointer to `head` and move both one step at a time; they meet at the cycle's entry. The same trick solves Find the Duplicate Number.
- **Cycle length:** from the meeting point, walk until you return to it.
