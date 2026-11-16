**Key insight:** if you sell on day `j`, the best buy is the minimum price on days `0..j-1`. Keep that running minimum and you only need one pass.

## Approach

1. Keep `minPrice`, the lowest price seen so far, and `best`, the best profit so far.
2. For each price, update `minPrice`, then try selling today: `best = max(best, price - minPrice)`.
3. Updating the minimum before computing the profit is safe — it just yields a profit of `0` for that day.

You can also frame it as a two-pointer window: `left` is the buy day, `right` scans forward, and whenever `prices[right] < prices[left]` the window restarts at `right`.

## Complexity

- Time `O(n)` — one pass.
- Space `O(1)`.

## Alternatives to mention

- Brute force over every (buy, sell) pair: `O(n²)`.
- Kadane's view: the answer is the maximum subarray sum of day-to-day differences.

## Pitfalls

- Returning a negative number for a strictly falling market — the answer floors at `0`.
- Selling before buying: taking `max - min` of the whole array ignores order.
