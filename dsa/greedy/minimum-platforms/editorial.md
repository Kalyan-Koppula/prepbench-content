**Key insight:** the platforms needed equals the peak number of trains in the station at once, and you can find that peak by sweeping sorted arrivals against sorted departures — which train is which doesn't matter.

## Approach

1. Copy and sort `arrival` and `departure` independently.
2. For each arrival in order, first release every departure that happened **strictly before** it (`dep[j] < time`), then count the new train.
3. Track the maximum count seen.

Using `<` (not `<=`) when releasing encodes the inclusive rule: a train leaving at `1000` still blocks a train arriving at `1000`.

Why sorting separately is fine: the count at any moment is (arrivals so far) − (departures so far), which only depends on the multiset of times, not on pairing them.

## Complexity

- Time `O(n log n)` for the sorts; the sweep is `O(n)`.
- Space `O(n)` for the sorted copies.

## Alternatives to mention

- Brute force: for each arrival time, count trains whose interval contains it — `O(n²)`.
- Difference array over the 2400 possible minutes: `+1` at arrival, `-1` just after departure, then a prefix-sum max. `O(n + T)` — good when the time range is small.
- Min-heap of departure times sorted by arrival — same as Meeting Rooms II.

## Pitfalls

- Getting the tie rule backwards (`<=`) undercounts when arrivals coincide with departures.
- Sorting the original arrays in place mutates the caller's input; copy first.
