**Key insight:** this is "longest subarray with at most 2 distinct values" in disguise — a variable sliding window with a count map.

## Approach

1. Extend `right` and increment `count[fruits[right]]`.
2. While the map holds more than two types, decrement `count[fruits[left]]`, deleting the key when it reaches zero, and advance `left`.
3. Record `right - left + 1`.

Generalises directly to "at most `k` distinct" by replacing `2` with `k`.

## Complexity

- Time `O(n)` — each index enters and leaves the window once.
- Space `O(1)` — the map never holds more than three keys.

## Alternatives to mention

- Brute force from every start: `O(n²)`.
- A two-variable version tracking the last two types and the length of the trailing run of the most recent type — `O(1)` space without a map, but fiddlier to get right.

## Pitfalls

- Not deleting keys at count zero, so `map.size` overstates the distinct types.
- Reading the story as "pick from any trees" — the trees must be consecutive.
