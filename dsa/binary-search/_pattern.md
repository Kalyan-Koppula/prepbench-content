---
title: Binary Search
order: 5
summary: Halve the search space each step — over a sorted array, or over the range of possible answers.
---

## Recognise it

- Input is sorted (or sorted then rotated) and the target is O(log n).
- "Find the first/last position where …" — a condition that flips from false to true exactly once.
- "Minimise the maximum" / "maximise the minimum" / "smallest speed/capacity/size such that …" → binary search **on the answer**.
- A brute force would try every candidate value `x` and run an O(n) feasibility check on each.

## Templates

```ts
// 1. Exact match in a sorted array
let lo = 0, hi = nums.length - 1
while (lo <= hi) {
  const mid = lo + ((hi - lo) >> 1)
  if (nums[mid] === target) return mid
  if (nums[mid] < target) lo = mid + 1
  else hi = mid - 1
}
return -1

// 2. First index where ok(i) is true (ok is false…false, true…true)
let lo = 0, hi = n            // hi = n means "none"
while (lo < hi) {
  const mid = (lo + hi) >> 1
  if (ok(mid)) hi = mid
  else lo = mid + 1
}
return lo

// 3. On the answer: smallest x in [low, high] with feasible(x)
let lo = low, hi = high
while (lo < hi) {
  const mid = Math.floor((lo + hi) / 2)
  if (feasible(mid)) hi = mid
  else lo = mid + 1
}
return lo
```

## Interview notes

- Say the invariant out loud: "the answer is always inside `[lo, hi]`". Every update must preserve it.
- Template 2/3 never overshoots: it converges on `lo === hi`, so there's no "was it `lo` or `lo - 1`?" debate.
- For "maximise the minimum", flip it: find the first `x` where `feasible(x)` becomes **false**, answer is `x - 1` — or use `mid = (lo + hi + 1) >> 1` with `lo = mid` / `hi = mid - 1`.
- On the answer, state the bounds and the monotonicity: "if capacity `c` works, any bigger capacity also works".
- Cost is `O(log(range) × cost of feasible)`, usually `O(n log(max))`.
- Rotated arrays: one half around `mid` is always sorted — decide which, then check if the target lies in it.

## Pitfalls

- Infinite loop: with `lo = mid` you must round `mid` **up**; with `hi = mid` round down.
- Mixing templates: `while (lo <= hi)` pairs with `hi = mid - 1`; `while (lo < hi)` pairs with `hi = mid`.
- `>> 1` works on 32-bit ints only — for values above ~2·10^9 use `Math.floor((lo + hi) / 2)`.
- Wrong bounds on the answer: the lower bound must be feasible-or-less (e.g. `max(weights)`, not `1`, for shipping), the upper bound must be feasible.
- Duplicates break "which half is sorted?" checks in rotated arrays — ask whether values are distinct.
