**Key idea:** you only ever need the `k` largest values seen so far, and among those, the smallest one is the answer. A min-heap of size `k` keeps exactly that: push each new value, and if the heap grows past `k`, pop its smallest. The top is always the kth largest.

## Recognising the pattern

"kth largest" over data that keeps arriving is the size-k heap template from the [Heap](/problems/patterns/heap) sheet. The counter-intuitive part is the heap's direction: for the k **largest**, use a **min**-heap, because its top is the one that gets evicted next.

## Brute force

Keep all values in an array sorted in descending order, inserting each new value in its place, and return the element at index `k − 1`. That is the reference brute force below. Each `add` costs `O(n)` for the insertion. (Re-sorting the whole array on each `add` would be `O(n log n)`.)

## Optimal: min-heap of size k

1. **Constructor:** create an empty min-heap and `add` every initial number.
2. **`add(val)`:**
   1. Push `val`.
   2. If the heap holds more than `k` values, pop the smallest.
   3. Return the top.

**Why it is correct.** After each `add`, the heap contains the `k` largest values seen (or all of them, while fewer than `k` exist). A popped value was smaller than `k` others, so it can never become one of the `k` largest later, since values are only added. The smallest of the kept values is, by definition, the kth largest.

## Walkthrough

`k = 3`, initial `[4, 5, 8, 2]`:

| operation | heap after (min first) | returns |
| --- | --- | --- |
| init 4, 5, 8 | 4, 5, 8 | |
| init 2 | 4, 5, 8 (2 popped) | |
| add(3) | 4, 5, 8 (3 popped) | 4 |
| add(5) | 5, 5, 8 (4 popped) | 5 |
| add(10) | 5, 8, 10 | 5 |
| add(9) | 8, 9, 10 | 8 |
| add(4) | 8, 9, 10 (4 popped) | 8 |

## Complexity

- Sorted array: `O(n)` per `add`, `O(n)` space for all values.
- Min-heap: `O(log k)` per `add`, `O(k)` space. The constructor is `O(n log k)`.

## Edge cases

- Fewer than `k` initial values: the heap fills up through the first calls. The problem guarantees at least `k` values exist when `add` returns.
- Duplicates count separately: the heap may hold several copies of a value.
- Negative numbers: the comparator handles them.

## Common mistakes

- A max-heap, whose top is the largest, not the kth largest.
- Keeping every value in the heap, which costs `O(log n)` per add and `O(n)` space.
- Popping before pushing, which can evict the wrong element when `val` is small.

## In the interview

- Say why the heap is a min-heap, in one sentence.
- Likely follow-ups:
  - *kth smallest instead?* A max-heap of size `k`.
  - *Values can also be removed?* A heap can't remove arbitrary items cheaply; use a balanced BST or a sorted structure, or lazy deletion.
  - *Median instead of kth?* Two heaps (Find Median from Data Stream).
