**Key idea:** process cars from the one closest to the target backwards. Compute each car's arrival time if it drove alone. A car whose time is **not later** than the fleet in front catches it and joins; a car whose time is later can never catch it and starts a new fleet. Count the new fleets.

## Recognising the pattern

Cars can't pass, so each car's fate depends only on the cars **ahead** of it, and in particular on the slowest arrival time among them. Sorting by position and sweeping while keeping that one value is a degenerate monotonic stack from the [Stack](/problems/patterns/stack) sheet: you could push arrival times and keep only increasing ones, but only the top is ever needed.

## Brute force

A car can never arrive before a car ahead of it, so its actual arrival time is the largest solo time among itself and every car ahead. Compute that for every car with a full scan, and count the distinct arrival times: each fleet arrives together, at its own time. That is the reference brute force below.

Correct because cars in one fleet share the arrival time of the fleet's slowest leader, and different fleets arrive at different times. Time `O(n²)`, space `O(n)`.

## Optimal: sort by position, sweep with the slowest time ahead

1. Order the cars from the closest to the target to the farthest.
2. `fleets = 0`, `slowestAhead = 0`.
3. For each car in that order:
   1. `time = (target − position) / speed`, its solo arrival time.
   2. If `time > slowestAhead`, it arrives after the fleet ahead even at full speed, so it can't catch it: `fleets++` and `slowestAhead = time`.
   3. Otherwise it catches the fleet ahead on or before the target and joins it.
4. Return `fleets`.

**Why "not later" means it joins.** If a car would arrive no later than the fleet ahead, while starting behind it, their paths must meet at or before the target. The statement counts a meeting exactly at the target as joining, which matches `time <= slowestAhead`.

## Walkthrough

`target = 12`, `position = [10, 8, 0, 5, 3]`, `speed = [2, 4, 1, 1, 3]`

| car (position) | solo time | slowestAhead before | result | fleets |
| --- | --- | --- | --- | --- |
| 10 | (12−10)/2 = 1 | 0 | new fleet | 1 |
| 8 | (12−8)/4 = 1 | 1 | joins (1 ≤ 1) | 1 |
| 5 | (12−5)/1 = 7 | 1 | new fleet | 2 |
| 3 | (12−3)/3 = 3 | 7 | joins | 2 |
| 0 | (12−0)/1 = 12 | 7 | new fleet | 3 |

Answer `3`.

## Complexity

- Brute force: time `O(n²)`, space `O(n)`.
- Sort and sweep: time `O(n log n)` for the sort, then `O(n)`. Space `O(n)` for the order array.

## Edge cases

- A single car: one fleet.
- Every car faster than the one ahead: they all merge into one fleet.
- Every car slower than the one ahead: every car is its own fleet.
- Equal arrival times: they merge exactly at the target, which counts as one fleet.

## Common mistakes

- Sorting by speed or time instead of position.
- Sweeping from the farthest car forward. A car's fate depends on the cars ahead, so start at the front.
- Simulating mile by mile, which is slow and runs into rounding problems.
- Comparing with `>=` and treating a catch at the target as a separate fleet.

## In the interview

- Say why only the cars ahead matter (no passing), and that only the slowest time ahead is needed.
- Mention floating-point times. To avoid them, compare `(target − p1) · s2` with `(target − p2) · s1` using integers.
- Likely follow-ups:
  - *When does each car arrive?* Its arrival time is the `slowestAhead` value after processing it.
  - *Collision times between neighbouring cars (Car Fleet II)?* A monotonic stack processed from the back, discarding cars that disappear into a fleet before they can be caught.
