**Key idea:** read the array as a linked list where index `i` points to index `nums[i]`. Because two indices hold the same value, two "nodes" point to the same place, which creates a cycle, and the cycle's entrance is the duplicate value. Floyd's cycle detection finds the entrance in linear time and constant space.

## Recognising the pattern

The constraints rule out the obvious tools: no modifying the array (so no sorting or marking) and `O(1)` space (so no hash set). Values in `[1, n]` that can be used as indices are the signal for the **fast/slow pointer** technique from the [Linked List](/problems/patterns/linked-list) sheet, applied to an implicit list.

## Brute force

A hash set finds the first repeat in `O(n)` time and space, and sorting finds it in `O(n log n)`, but both break the rules.

The reference brute force below obeys the rules with **binary search on the value**: for a candidate `mid`, count how many numbers are `<= mid`. Without a duplicate in `[1, mid]`, that count is at most `mid`; if it is larger, the duplicate is in `[1, mid]`. Time `O(n log n)`, space `O(1)`.

## Optimal: Floyd's cycle detection on indices

Index 0 is never pointed to (values start at 1), so it is a safe starting node outside any cycle.

1. **Find a meeting point.** `slow = nums[0]`, `fast = nums[nums[0]]`. Move `slow` one step (`slow = nums[slow]`) and `fast` two steps (`fast = nums[nums[fast]]`) until they are equal.
2. **Find the entrance.** Reset `slow = 0` and leave `fast` at the meeting point. Move both one step at a time. Where they meet is the entrance of the cycle.
3. Return it.

**Why the entrance is the duplicate.** The entrance is a node with two incoming arrows: one from the path leading into the cycle and one from inside the cycle. An incoming arrow to node `v` comes from an index `i` with `nums[i] = v`. Two incoming arrows mean two indices share the value `v`: the duplicate.

**Why phase 2 works.** Let the path from the start to the entrance have length `a`, and let them meet `b` steps into the cycle of length `L`. `fast` travelled twice as far as `slow`, which works out to `a = (multiple of L) − b`. So walking `a` steps from the start and `a` steps from the meeting point lands both on the entrance.

## Walkthrough

`nums = [1, 3, 4, 2, 2]`. Links: `0→1, 1→3, 2→4, 3→2, 4→2`. Path from 0: `0 → 1 → 3 → 2 → 4 → 2 → 4 …`, a cycle `2 → 4 → 2` entered at 2.

| phase | slow | fast |
| --- | --- | --- |
| 1 start | 1 | 3 |
| 1 | 3 | 4 (3→2→4) |
| 1 | 2 | 4 (4→2→4) |
| 1 | 4 | 4 → meet |
| 2 start | 0 | 4 |
| 2 | 1 | 2 |
| 2 | 3 | 4 |
| 2 | 2 | 2 → entrance |

Answer `2`.

## Complexity

- Hash set: time `O(n)`, space `O(n)` (not allowed).
- Binary search on value: time `O(n log n)`, space `O(1)`.
- Floyd: time `O(n)`, space `O(1)`.

## Edge cases

- The duplicate appears many times: still a single entrance.
- `n = 1`, `nums = [1, 1]`: `0 → 1 → 1`, a self-loop at 1.
- The duplicate is `n`: no special handling needed.

## Common mistakes

- Starting both pointers at the same node and checking for equality before moving.
- Resetting the wrong pointer in phase 2, or moving one of them two steps.
- Sorting or marking the array, which the statement forbids.

## In the interview

- Explain the index-as-pointer view first; without it the cycle argument makes no sense.
- Offer the binary-search-on-value solution as a fallback if you're unsure about Floyd's proof.
- Likely follow-ups:
  - *Modifying the array is allowed?* Mark visited values by negating `nums[abs(x)]`; the first already-negative position is the duplicate.
  - *Several values repeat?* The cycle trick finds one; finding all needs marking or counting.
