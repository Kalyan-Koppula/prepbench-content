---
title: Linked List
order: 6
summary: Pointer surgery — dummy heads, fast/slow pointers, and in-place reversal.
---

## Recognise it

- Input is a `ListNode`; you must rewire, not copy.
- "Middle", "cycle", "k-th from end" → fast/slow pointers.
- "Reverse a part", "reorder", "palindrome" → reverse a sub-list in place.

## Templates

```ts
// Reverse
let prev: ListNode | null = null
let cur = head
while (cur) {
  const next = cur.next
  cur.next = prev
  prev = cur
  cur = next
}
return prev

// Dummy head: removes the "is this the head?" special case
const dummy = new ListNode(0, head)
let tail = dummy
```

## Interview notes

- Draw three nodes and walk the pointers before coding.
- A dummy node makes insert/delete at the head identical to the middle.
- Fast/slow: when `fast` reaches the end, `slow` is at the middle; if they meet, there's a cycle.

## Pitfalls

- Losing the rest of the list: save `next` before overwriting `cur.next`.
- Forgetting to terminate the new tail (`tail.next = null`) creates cycles.
