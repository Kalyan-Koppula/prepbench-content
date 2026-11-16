---
title: Sliding Window
order: 3
summary: Grow the right edge, shrink the left edge — every contiguous range in one O(n) sweep.
---

## Recognise it

- "Longest / shortest / count of **contiguous** subarrays or substrings" that satisfy a condition.
- The condition is **monotone**: if a window is valid, every smaller window inside it is too (or the reverse).
- A fixed window size `k` slides across the input ("every window of size k").
- Brute force would enumerate all `O(n²)` ranges and recheck each one.

## Templates

```ts
// Variable window: longest valid window
let left = 0, best = 0
for (let right = 0; right < s.length; right++) {
  add(s[right])
  while (!valid()) remove(s[left++])
  best = Math.max(best, right - left + 1)
}
```

```ts
// Variable window: shortest window that satisfies a requirement
let left = 0, best = Infinity
for (let right = 0; right < n; right++) {
  add(a[right])
  while (satisfied()) {
    best = Math.min(best, right - left + 1)
    remove(a[left++])
  }
}
```

```ts
// Fixed window of size k
for (let i = 0; i < n; i++) {
  add(a[i])
  if (i >= k) remove(a[i - k])
  if (i >= k - 1) record()
}
```

## Interview notes

- Say why it's O(n): each index enters the window once and leaves it at most once.
- Window state is usually a count map, a 26-length array, or a running sum — keep updates O(1).
- "Exactly K" counts are awkward to slide directly; use `atMost(K) - atMost(K - 1)`.
- Max/min of every window needs a **monotonic deque** of indices, not a heap (heap is O(n log n)).
- Negative numbers break "sum ≤ k" windows (shrinking no longer helps) — switch to prefix sums.
- For "longest" problems you may skip the `while` and shrink by one with an `if`: the window never shrinks below the best size seen, which is all you need.

## Pitfalls

- Off-by-one in the window length: it's `right - left + 1`.
- Forgetting to decrement/delete counts when the left edge moves.
- Recording the answer at the wrong moment — before shrinking for "longest", inside the shrink loop for "shortest".
- Comparing two count maps on every step is O(26) — fine — but comparing `Map`s by reference is always false.
