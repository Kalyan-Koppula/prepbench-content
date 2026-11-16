**Key insight:** a car's arrival time is either its own solo time or, if it catches up, the arrival time of the fleet ahead. Sort by position, closest to the target first, and count cars whose solo time is **strictly greater** than the slowest arrival seen so far — each one starts a new fleet.

## Approach

1. For each car compute `time = (target - position) / speed`.
2. Sort cars by position descending.
3. Track the arrival time of the fleet immediately ahead. If the current car's time is greater, it can't catch up: new fleet, and it becomes the new "fleet ahead". Otherwise it merges and arrives with that fleet.

This is the stack solution with the stack collapsed to its top: the stack version pushes each time and pops it again when it is `<=` the time below it; the final stack size is the answer.

## Complexity

- Time `O(n log n)` for the sort.
- Space `O(n)` for the paired array.

## Alternatives to mention

- Counting sort by position (positions are bounded by `target`) gives `O(n + target)`.
- Avoiding floating point: compare `(target - p1) * s2` with `(target - p2) * s1` — exact integer products up to `10^12`.

## Pitfalls

- Sorting ascending and walking the wrong way — fleets form behind the leader, so start from the front of the road.
- Using `>=` instead of `>`: arriving at exactly the same time means the cars meet at the target and form one fleet.
- Forgetting to carry `position` and `speed` together through the sort.
