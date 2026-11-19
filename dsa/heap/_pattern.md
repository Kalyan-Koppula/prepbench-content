---
title: Heap / Priority Queue
order: 10
summary: Always know the smallest (or largest) item in O(1) and add or remove items in O(log n) — the tool for "top k", "next best" and running medians.
---

## The idea

A heap answers one question fast: **what is the smallest item right now?** It keeps that item on top, and it can add an item or remove the top in `O(log n)`. It does not keep everything sorted. That is the point: maintaining full order costs more than you need when you only ever look at the best item.

A binary min-heap is a complete binary tree stored in an array, where every parent is `<=` its children:

```
            1                 index:  0  1  2  3  4  5  6
          /   \               value:  1  3  2  7  4  5  9
         3     2
        / \   / \             children of i:  2i + 1 and 2i + 2
       7   4 5   9            parent of i:    floor((i - 1) / 2)
```

- **Push:** put the new item at the end of the array, then swap it upward while it is smaller than its parent ("sift up").
- **Pop:** take the root, move the last item into the root, then swap it downward with its smaller child while it is larger ("sift down").

Both walk one root-to-leaf path, and the tree is complete, so its height is `log₂ n`.

A **max-heap** is the same with the comparison reversed. In code you almost always get one from a priority queue with a comparator: `(a, b) => a - b` for a min-heap, `(a, b) => b - a` for a max-heap. Java has `PriorityQueue`, C++ `priority_queue`, Python `heapq`. JavaScript has none built in; this site's editor provides `PriorityQueue` with `push`, `pop`, `peek`, `size` and `isEmpty`, and the template below shows how to write one.

## When to reach for it

- "**k largest**", "k smallest", "k closest", "k most frequent": keep a heap of size `k`.
- "Repeatedly take the best item, change it, and put it back": simulations like Last Stone Weight or task scheduling.
- **Merging** many sorted sources: always take the smallest current front (Merge k Sorted Lists).
- A **running median** or other order statistic over a stream: two heaps.
- Shortest paths with weights: Dijkstra's algorithm is BFS with a min-heap (see [Advanced Graphs](/problems/patterns/advanced-graphs)).

Look-alikes:

| Statement says | What to use instead |
| --- | --- |
| All items in sorted order, once | Just sort |
| kth largest, one-off, average linear time | Quickselect |
| Min or max of a sliding window | Monotonic deque ([Sliding Window](/problems/patterns/sliding-window)) |
| Ordered queries with deletions of arbitrary items | A balanced BST or a sorted structure |

## How it works

Pushing `0` into the heap above:

| step | array | action |
| --- | --- | --- |
| append | 1 3 2 7 4 5 9 **0** | 0 is at index 7, parent index 3 (7) |
| sift up | 1 3 2 **0** 4 5 9 7 | 0 < 7, swap; parent index 1 (3) |
| sift up | 1 **0** 2 3 4 5 9 7 | 0 < 3, swap; parent index 0 (1) |
| sift up | **0** 1 2 3 4 5 9 7 | 0 < 1, swap; at the root |

Three swaps for eight items: one per level. Popping reverses the idea: the root leaves, the last item fills the hole and sinks.

The **invariant** is local (every parent `<=` its children) yet guarantees the global fact that the root is the minimum, because the minimum can't have a smaller parent.

## Templates

### A minimal binary heap

```ts
class MinHeap {
  items: number[]

  constructor() {
    this.items = []
  }

  push(value: number): void {
    this.items.push(value)
    let i = this.items.length - 1
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2)
      if (this.items[parent] <= this.items[i]) {
        break
      }
      const temp = this.items[parent]
      this.items[parent] = this.items[i]
      this.items[i] = temp
      i = parent
    }
  }

  pop(): number {
    const top = this.items[0]
    const last = this.items.pop() as number
    if (this.items.length > 0) {
      this.items[0] = last
      let i = 0
      while (true) {
        const left = 2 * i + 1
        const right = 2 * i + 2
        let smallest = i
        if (left < this.items.length && this.items[left] < this.items[smallest]) {
          smallest = left
        }
        if (right < this.items.length && this.items[right] < this.items[smallest]) {
          smallest = right
        }
        if (smallest === i) {
          break
        }
        const temp = this.items[smallest]
        this.items[smallest] = this.items[i]
        this.items[i] = temp
        i = smallest
      }
    }
    return top
  }
}
```

- Sift down picks the **smaller** child, so the new parent is `<=` both children.
- Pop on a one-item heap must not put the last item back.

### Top k with a heap of size k

```ts
function kLargest(nums: number[], k: number): number[] {
  const heap = new PriorityQueue<number>((a, b) => a - b) // min-heap
  for (let i = 0; i < nums.length; i++) {
    heap.push(nums[i])
    if (heap.size() > k) {
      heap.pop() // drop the smallest: it can't be among the k largest
    }
  }
  const result: number[] = []
  while (!heap.isEmpty()) {
    result.push(heap.pop() as number)
  }
  return result
}
```

- For the k **largest**, use a **min**-heap: its top is the weakest of the current top `k`, the one to evict. For the k smallest, use a max-heap.
- Cost `O(n log k)`, better than sorting when `k` is small.

### Two heaps for a running median

```ts
// lower: max-heap with the smaller half. upper: min-heap with the larger half.
// Keep lower.size() === upper.size() or lower.size() === upper.size() + 1.
function addNumber(lower: PriorityQueue<number>, upper: PriorityQueue<number>, x: number): void {
  lower.push(x)
  upper.push(lower.pop() as number) // the largest of the lower half moves up
  if (upper.size() > lower.size()) {
    lower.push(upper.pop() as number) // rebalance
  }
}
// median: lower.peek() if sizes differ, else the average of both tops
```

### Choosing a template

- Best k of many: **size-k heap**, with the opposite kind of heap.
- Repeatedly take, change and put back: a **plain heap** of everything.
- Median or a split around a rank: **two heaps**.
- k sorted sources: a heap of **one front per source**.

## Choosing what to put in the heap

| Problem shape | Heap holds | Ordered by |
| --- | --- | --- |
| k closest points | Points | Distance, max-heap of size k |
| Task scheduling | Remaining counts per task | Count, max-heap, plus a cooldown queue |
| Reorganise a string | Letters with remaining counts | Count, max-heap |
| Merge k lists | One node per list | Value, min-heap |
| Twitter news feed | One tweet per followed user | Time, max-heap |
| Dijkstra | (distance, node) pairs | Distance, min-heap |

Compare squared distances instead of distances: the order is the same and you avoid square roots.

## Worked problems

**Kth Largest Element in a Stream.** Keep a min-heap of the `k` largest values seen. Each new value is pushed; if the heap grows past `k`, pop. The top is the kth largest.

**Last Stone Weight.** A max-heap of all stones. Pop the two heaviest, push back the difference if it isn't zero, and repeat until at most one stone is left.

**Task Scheduler.** Greedily run the task with the most remaining copies. A max-heap of counts picks it; tasks that just ran wait in a cooldown queue with the time they can run again.

**Find Median from Data Stream.** Two heaps split the numbers into a lower and an upper half of equal size (or the lower one bigger by one). The median is the top of the lower half, or the average of both tops.

## Variations and tricks

- **Lazy deletion.** To remove arbitrary items, mark them as deleted and skip them when they reach the top.
- **Heapify in `O(n)`.** Building a heap from an array by sifting down from the middle is linear, not `n log n`.
- **Pairs as items.** Push `(priority, data)` pairs and compare by priority, with a tie-breaker if order matters.
- **Quickselect** for one-off kth-element questions: average `O(n)`, worst `O(n²)`, mentioned as the alternative to a heap.
- **Bucket counts** instead of a heap when priorities are small integers (Top K Frequent Elements).

## Complexity

- Push and pop: `O(log n)`. Peek: `O(1)`.
- Top k with a size-k heap: `O(n log k)` time, `O(k)` space.
- Building a heap from `n` items by pushing: `O(n log n)`; by heapify: `O(n)`.
- Two-heap median: `O(log n)` per insert, `O(1)` per median query.

## Pitfalls

- Using a max-heap for the k largest (it should be a min-heap of size k), or the reverse.
- Sorting an array on every insert instead of using a heap.
- Comparing with a comparator that returns booleans instead of numbers.
- Forgetting that a heap's array isn't sorted; only the top is guaranteed.
- `shift()`-based queues or repeated `sort()` calls hidden inside a loop, which destroy the complexity.

## Practice ladder

1. [Kth Largest Element in a Stream](/problems/kth-largest-element-in-a-stream): a min-heap of size k, updated per value.
2. [Last Stone Weight](/problems/last-stone-weight): a max-heap simulation.
3. [K Closest Points to Origin](/problems/k-closest-points-to-origin): top k by a computed key, with a max-heap.
4. [Kth Largest Element in an Array](/problems/kth-largest-element-in-an-array): size-k heap versus quickselect.
5. [Task Scheduler](/problems/task-scheduler): greedy with a heap and a cooldown queue (or a counting formula).
6. [Reorganize String](/problems/reorganize-string): always place the most frequent letter that isn't the previous one.
7. [Design Twitter](/problems/design-twitter): merging per-user feeds with a heap.
8. [Find Median from Data Stream](/problems/find-median-from-data-stream): two balanced heaps.
