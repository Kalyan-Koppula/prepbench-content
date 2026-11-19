**Key idea:** two baskets, one fruit type each, means you can only keep picking while the trees you've walked contain **at most two types**. So the answer is the longest contiguous window with at most two distinct values. Grow it to the right and shrink it from the left whenever a third type appears.

## Recognising the pattern

Strip away the story and it is "longest subarray with at most 2 distinct values", the "longest valid window" template from the [Sliding Window](/problems/patterns/sliding-window) sheet. The window state is a count per fruit type in a map, and the number of distinct types is the map's size, as long as zero counts are deleted.

## Brute force

For each starting tree, walk right and remember up to two types. Stop at the first tree of a third type. Track the longest walk. That is the reference brute force below.

Correct because it simulates every starting tree. Time `O(n²)`, space `O(1)`.

## Optimal: sliding window with type counts

1. Empty map `count`, `left = 0`, `best = 0`.
2. For each `right`:
   1. Increment `count[fruits[right]]`.
   2. While the map has more than 2 keys: decrement `count[fruits[left]]`, delete it if it hits 0, and `left++`.
   3. Update `best` with `right - left + 1`.
3. Return `best`.

The invariant: after step 2, `[left, right]` is the longest window ending at `right` with at most two types. Any window starting further left would include a fruit of the type just removed, together with the other two.

A variant tracks the last two types and where the current run of the last type began, giving `O(1)` space without a map. It is fiddlier, and the map version generalises to "at most `k` types".

## Walkthrough

`fruits = [1, 2, 1, 3, 3, 2]`

| right | fruit | counts after add | shrink | window | length | best |
| --- | --- | --- | --- | --- | --- | --- |
| 0 | 1 | {1:1} | – | [0,0] | 1 | 1 |
| 1 | 2 | {1:1, 2:1} | – | [0,1] | 2 | 2 |
| 2 | 1 | {1:2, 2:1} | – | [0,2] | 3 | 3 |
| 3 | 3 | {1:2, 2:1, 3:1} | drop index 0 (1), then index 1 (2) → {1:1, 3:1} | [2,3] | 2 | 3 |
| 4 | 3 | {1:1, 3:2} | – | [2,4] | 3 | 3 |
| 5 | 2 | {1:1, 3:2, 2:1} | drop index 2 (1) → {3:2, 2:1} | [3,5] | 3 | 3 |

Answer `3`, for example `[1, 2, 1]` or `[3, 3, 2]`.

## Complexity

- Brute force: time `O(n²)`, space `O(1)`.
- Sliding window: time `O(n)`, each index enters and leaves once. Space `O(1)`: the map never holds more than 3 keys.

## Edge cases

- One or two types in total: the whole row fits, so the answer is `n`.
- Every tree different: the best is 2 (or 1 for a single tree).
- A long run of one type between others: the window keeps it and swaps the second type.

## Common mistakes

- Leaving zero-count keys in the map, so `size` overcounts the types.
- Shrinking only once with an `if`. Here you need a `while`, because the window must become valid before you record its length.
- Recording the length before shrinking.

## In the interview

- Say the translation first: "the longest window with at most two distinct values."
- Likely follow-ups:
  - *`k` baskets?* Replace 2 with `k`; nothing else changes.
  - *Count the subarrays with exactly `k` types?* Use the "at most `k` minus at most `k − 1`" trick (Subarrays with K Different Integers).
