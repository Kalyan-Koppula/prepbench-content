**Key insight:** with fractions allowed, the bag is just `capacity` units of space, and each unit should hold the densest value available — so fill greedily by `value / weight`.

## Approach

1. Sort items by density `values[i] / weights[i]`, highest first.
2. Walk the list: if the whole item fits, take it; otherwise take the fraction `room / weight` and stop.
3. Return the accumulated value.

Exchange argument: if an optimal packing holds some weight of a lower-density item while a higher-density item isn't fully taken, swapping that weight for the denser item increases (or keeps) the value. So the optimum takes denser items first.

## Complexity

- Time `O(n log n)` for the sort.
- Space `O(n)` for the index order.

## Alternatives to mention

- Without the sort you can get `O(n)` expected time with a quickselect-style partition on density around the capacity cut-off — rarely expected, but a nice follow-up answer.
- Contrast with **0/1 knapsack**: once items are indivisible, greedy-by-density fails (e.g. capacity `10`, items `(value 7, weight 6)` and two of `(value 5, weight 5)`: density-first takes the 7 and nothing else fits, while the two 5s make 10) and you need DP over capacity.

## Pitfalls

- Sorting by value or by weight alone.
- Comparing densities with floating-point division is usually fine, but cross-multiplying (`v_b * w_a - v_a * w_b`) avoids precision ties entirely.
- The answer is fractional — don't round or floor it.
