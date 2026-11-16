---
title: Two Pointers
order: 2
summary: Two indices moving through a sorted array or from both ends — each step rules out a whole row of pairs.
---

## Recognise it

- The input is **sorted** (or you're allowed to sort it) and you need a pair/triple with some sum.
- "In place", "O(1) extra space", "remove / move / partition elements".
- Comparing symmetric positions: palindromes, reversing, mirrored checks.
- Maximising something that depends on the two ends of a range (container, trapped water).

## Templates

Opposite ends (sorted input, pair sum):

```ts
let l = 0, r = nums.length - 1
while (l < r) {
  const sum = nums[l] + nums[r]
  if (sum === target) return [l, r]
  if (sum < target) l++ // need bigger: drop the smallest
  else r--              // need smaller: drop the largest
}
```

Same direction (read/write, in-place compaction):

```ts
let write = 0
for (let read = 0; read < nums.length; read++) {
  if (keep(nums[read])) nums[write++] = nums[read]
}
// nums[0..write) is the kept prefix
```

## Interview notes

- Justify every pointer move: "if the sum is too small, nothing paired with `nums[l]` can work, so discard `l`." That argument is what makes it O(n) instead of O(n²).
- k-sum reduces to (k−1) nested loops around a two-pointer core: 3Sum is `O(n²)`, 4Sum `O(n³)`.
- Skip duplicates *after* using a value, not before, to keep distinct tuples without a set.
- Merging two sorted arrays in place: fill from the **back** so you never overwrite unread data.
- If the input isn't sorted and you need original indices, a hash map is usually better than sort + two pointers.

## Pitfalls

- `while (l <= r)` vs `while (l < r)`: pairs need two distinct positions.
- Forgetting to move a pointer after a match → infinite loop.
- Duplicate-skipping loops must still check bounds (`l < r && nums[l] === nums[l - 1]`).
- Sums of large values can overflow in other languages — mention it even though JS numbers are safe up to `2^53`.
