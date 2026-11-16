---
title: Find Median from Data Stream
difficulty: Hard
order: 8
lists: [neetcode150, striver]
tags: [heap, two-heaps, design]
leetcode: find-median-from-data-stream
kind: class
class: MedianFinder
params: []
methods:
  - name: addNum
    params: [{ name: num, type: number }]
    returns: void
  - name: findMedian
    params: []
    returns: number
compare: float
hints:
  - The median only depends on the middle one or two values. Split the numbers into a lower half and an upper half.
  - Keep the lower half in a max-heap and the upper half in a min-heap, with sizes differing by at most one. The median is read from the heap tops.
complexity: { time: "O(log n) add, O(1) median", space: "O(n)" }
---

Design a structure that receives integers one at a time and can report the **median** of everything received so far.

- `addNum(num)` adds `num`.
- `findMedian()` returns the median: the middle value when the count is odd, or the average of the two middle values when it is even (this may be a fraction, e.g. `2.5`).

Answers within `10^-5` of the true median are accepted.

Tests are a sequence of operations: the first creates the object, and the output lists each call's return value (`null` for the constructor and methods that return nothing).

## Constraints

- `-10^5 <= num <= 10^5`
- `findMedian` is only called after at least one `addNum`.
- At most `5 * 10^4` calls in total.

**Follow-up:** if every number were in `[0, 100]`, how would you make both operations faster?
