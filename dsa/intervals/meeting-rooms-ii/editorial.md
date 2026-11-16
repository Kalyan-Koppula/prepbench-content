**Key insight:** the number of rooms equals the maximum number of meetings in progress at any instant. Process meetings by start time and keep a min-heap of end times for rooms in use; reuse the room that frees up first.

## Approach (heap)

1. Sort meetings by start.
2. For each meeting, if the earliest-ending room has `end <= start`, pop it — that room is free again.
3. Push this meeting's end. The heap size is the number of rooms in use.
4. The final heap size is the peak, since we only ever pop one room when we push one.

`PriorityQueue` is provided here; in an interview you may be asked to implement a binary heap or to switch to the sweep below.

## Approach (two-pointer sweep)

Sort all starts and all ends separately. Walk the starts; before counting a start, advance the end pointer past every end `<= start` (those rooms are free). Track the maximum count. No heap needed, same `O(n log n)`.

## Complexity

- Time `O(n log n)` — sorting plus `n` heap operations.
- Space `O(n)` for the heap.

## Alternatives to mention

- Count overlaps at every start time: `O(n²)`.
- Difference array / line sweep over `+1` at start, `-1` at end, processing ends before starts at equal times.

## Pitfalls

- Using `<` instead of `<=` when freeing a room — back-to-back meetings share a room.
- With the event sweep, processing a start before an end at the same time overcounts.
