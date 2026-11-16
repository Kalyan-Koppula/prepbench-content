---
title: Heap / Priority Queue
order: 10
summary: Repeatedly grab the smallest or largest item in O(log n) — top-k, streaming medians, greedy scheduling.
---

## Recognise it

- "k-th largest / smallest", "top k", "k closest" — keep a heap of size `k`.
- You repeatedly need the current min or max while items keep arriving or changing (simulation, scheduling, merging sorted streams).
- Running median or "balance two halves" — two heaps.
- Greedy "always pick the most frequent / cheapest remaining".

## Template (built-in global)

```ts
const minHeap = new PriorityQueue<number>()              // smallest on top
const maxHeap = new PriorityQueue<number>((a, b) => b - a) // largest on top
const byDist = new PriorityQueue<[number, number]>((a, b) => a[0] - b[0])

minHeap.push(5)
minHeap.peek() // smallest, not removed
minHeap.pop()  // smallest, removed
minHeap.size()

// Top-k largest: keep a min-heap of size k; its top is the k-th largest.
for (const x of nums) {
  heap.push(x)
  if (heap.size() > k) heap.pop()
}
```

## Hand-rolled min-heap

```ts
class MinHeap {
  a: number[] = []
  push(x: number) {
    const a = this.a
    a.push(x)
    let i = a.length - 1
    while (i > 0 && a[(i - 1) >> 1] > a[i]) {
      const p = (i - 1) >> 1
      ;[a[i], a[p]] = [a[p], a[i]]
      i = p
    }
  }
  pop(): number | undefined {
    const a = this.a
    if (a.length <= 1) return a.pop()
    const top = a[0]
    a[0] = a.pop()!
    for (let i = 0; ; ) {
      const l = 2 * i + 1, r = l + 1
      let m = i
      if (l < a.length && a[l] < a[m]) m = l
      if (r < a.length && a[r] < a[m]) m = r
      if (m === i) break
      ;[a[i], a[m]] = [a[m], a[i]]
      i = m
    }
    return top
  }
}
```

## Interview notes

- Array layout: children of `i` are `2i + 1` and `2i + 2`, parent is `(i - 1) >> 1`. Push sifts up, pop moves the last item to the root and sifts down — both `O(log n)`.
- Heapify an existing array bottom-up in `O(n)`; pushing items one by one is `O(n log n)`.
- Top-k: a min-heap of size `k` gives `O(n log k)` time and `O(k)` space, better than sorting when `k ≪ n`.
- Quickselect finds the k-th element in `O(n)` average — mention it as the alternative.
- JS has no built-in heap; say whether you'll use a helper or write one. Many interviewers accept a helper, then ask you to sketch sift-up/sift-down.

## Pitfalls

- The default comparator is a min-heap; flip it for max (`(a, b) => b - a`).
- Comparators return a number: break ties on tuples explicitly (`a[0] - b[0] || a[1] - b[1]`); for strings use `<`/`>` or `localeCompare`, not subtraction.
- Heaps don't support "remove arbitrary item" efficiently — use lazy deletion (skip stale entries when popped).
- Forgetting the empty case: `peek()`/`pop()` return `undefined`.
