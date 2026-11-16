---
title: Arrays & Hashing
order: 1
summary: Trade memory for time — a hash map turns "have I seen X?" into O(1).
---

## Recognise it

- "Find a pair / group / duplicate" in an unsorted array.
- You'd otherwise compare every pair (O(n²)).
- Counting frequencies, grouping by a canonical key, or checking membership.

## Template

```ts
const seen = new Map<number, number>() // value -> index (or count)
for (let i = 0; i < nums.length; i++) {
  const need = target - nums[i]
  if (seen.has(need)) return [seen.get(need)!, i]
  seen.set(nums[i], i)
}
```

## Interview notes

- State the trade-off out loud: O(n) extra space buys O(n) time.
- Canonical keys: sorted string for anagrams, a 26-length count joined by `#`, a tuple as `${a},${b}`.
- `Map` keeps insertion order and allows any key type; plain objects coerce keys to strings.
- Prefix sums + a map answer "subarray sums to k" in one pass: look up `prefix - k`.

## Pitfalls

- Inserting before checking lets an element pair with itself.
- Counting with `obj[k]++` on a missing key gives `NaN`; use `(m.get(k) ?? 0) + 1`.
