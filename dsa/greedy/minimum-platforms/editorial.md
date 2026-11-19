**Key idea:** the number of platforms needed is the largest number of trains in the station at the same moment. Sort the arrival times and the departure times **separately** and sweep through them in time order, adding one for each arrival and removing one for each departure. The peak count is the answer.

## Recognising the pattern

"How many resources at once?" over a set of intervals is the sweep-line pattern, shared with Meeting Rooms II in [Intervals](/problems/patterns/intervals) and described in the [Greedy](/problems/patterns/greedy) sheet. Which train uses which platform doesn't matter, only how many overlap, so the arrivals and departures can be sorted independently.

## Brute force

The busiest moment is always at some arrival (the count only rises at arrivals). For each arrival time, count the trains with `arrival ≤ t ≤ departure`. That is the reference brute force below. `O(n²)` time.

## Sweep over sorted times

1. Sort `arr` and `dep` separately.
2. `inStation = 0`, `best = 0`, `j = 0`.
3. For each arrival `arr[i]` in order:
   1. While `dep[j] < arr[i]`: a train left before this one arrives, so `inStation--`, `j++`.
   2. `inStation++`; `best = max(best, inStation)`.
4. Return `best`.

**Why `<` and not `<=`.** A train departing at the exact minute another arrives still occupies its platform at that minute. Using `<` processes the departure only if it is strictly earlier. (If the problem said a platform frees up at the departure minute, you would use `<=`.)

## Walkthrough

`arrival = [900, 940, 950]`, `departure = [910, 1200, 1120]`. Sorted departures: `[910, 1120, 1200]`.

| arrival | departures processed | in station | best |
| --- | --- | --- | --- |
| 900 | none | 1 | 1 |
| 940 | 910 | 0 → 1 | 1 |
| 950 | none (1120 is later) | 2 | 2 |

Answer `2`: from 9:50 to 11:20 two trains are in the station.

## Complexity

- Check at each arrival: `O(n²)`.
- Sort and sweep: `O(n log n)` time, `O(n)` space for the sorted copies.
- With times limited to a day (0 to 2359), a difference array over minutes gives `O(n + T)`.

## Edge cases

- One train: 1.
- Arrival equal to another train's departure: both count at that minute.
- Trains that don't overlap at all: 1.

## Common mistakes

- Sorting the pairs together by arrival and comparing each train only with the previous one.
- Using `<=` when the problem counts the departure minute as occupied (or the reverse).
- Forgetting that sorting departures separately is allowed because trains are interchangeable for counting.

## In the interview

- Explain why separate sorting is valid; it surprises many people.
- Likely follow-ups:
  - *Which platform does each train use?* Sort by arrival and keep a min-heap of `(departure, platform)`; reuse the earliest freed platform.
  - *Meeting Rooms II?* The same problem with half-open intervals.
