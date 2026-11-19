**Key idea:** an inorder traversal of a BST lists its values in sorted order. Once the values are sorted, Two Sum is the classic two-pointer sweep: start at both ends, move the left pointer up when the sum is too small and the right pointer down when it is too large.

## Recognising the pattern

"Find two values with a given sum" plus "the input is sorted" is the opposite-ends sweep from the [Two Pointers](/problems/patterns/two-pointers) sheet. A BST is sorted data in tree form, which is the central fact of the [Binary Search Trees](/problems/patterns/bst) sheet: inorder turns it back into a sorted array.

## Brute force

Collect every value and test every pair. That is the reference brute force below. Time `O(n²)`, space `O(n)`.

## Better: hash set during any traversal

Walk the tree in any order. For each value `x`, check whether `k − x` is already in a set, then add `x`. Time `O(n)`, space `O(n)`. It works for any binary tree and doesn't use the ordering at all.

## Optimal: inorder plus two pointers

1. Inorder traversal into an array `values` (sorted, since values are distinct).
2. `i = 0`, `j = n − 1`. While `i < j`:
   - `sum = values[i] + values[j]`. Equal to `k`: return `true`.
   - Smaller: `i++` (the smallest value can't reach `k` even with the largest).
   - Larger: `j−−`.
3. Return `false`.

`i < j` guarantees the two values come from different nodes.

**Using less memory.** Instead of an array, keep two BST iterators: an ascending one (inorder with a stack going left) and a descending one (going right). They act as the two pointers, using `O(h)` memory instead of `O(n)`. More code, but a good follow-up answer.

## Walkthrough

Tree with values `2, 3, 4, 5, 6, 7` (root 5), `k = 9`.

| i (value) | j (value) | sum | action |
| --- | --- | --- | --- |
| 0 (2) | 5 (7) | 9 | found → `true` |

With `k = 28`: the sums go 9 (too small) → `i` moves up to 7 → 13 … until `i` and `j` meet, so `false`.

## Complexity

- Brute force: time `O(n²)`, space `O(n)`.
- Hash set: time `O(n)`, space `O(n)`.
- Inorder and two pointers: time `O(n)`, space `O(n)` for the array.
- Two iterators: time `O(n)`, space `O(h)`.

## Edge cases

- A single node: no pair, so `false`.
- `k` equal to twice a value: needs two different nodes, which `i < j` (or checking the set before adding) enforces.
- Negative values: the sweep doesn't care about sign.

## Common mistakes

- Pairing a node with itself, for example by adding `x` to the set before checking `k − x`.
- Searching for `k − x` in the BST from the root for every node: correct, but `O(n · h)`.
- Forgetting that inorder must be left, node, right to be sorted.

## In the interview

- Offer the hash set (works on any tree), then point out that a BST is sorted and the two-pointer version follows.
- Mention the two-iterator version if memory is a concern.
- Likely follow-ups:
  - *Many queries with different `k`?* Keep the sorted array and answer each query with the sweep.
  - *Three values?* Fix one and sweep the rest: `O(n²)` (3Sum on the inorder array).
