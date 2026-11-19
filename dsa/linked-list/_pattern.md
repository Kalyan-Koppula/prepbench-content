---
title: Linked List
order: 6
summary: Rewire nodes in place with dummy heads, fast/slow pointers, reversal and merging, all in O(1) extra space.
---

## The idea

A linked list is a chain of nodes. Each node holds a value and one reference, `next`, to the node after it. There are no indexes: the only way to reach the fifth node is to start at `head` and follow `next` four times. Almost every linked list problem is **pointer surgery**: change which node points to which, in place, without losing your grip on any part of the chain.

Think of each pointer variable as a finger resting on a node:

```
head
 │
 ▼
[1] ──► [2] ──► [3] ──► [4] ──► null
         ▲       ▲
        prev    cur
```

If you overwrite `cur.next` and no other finger is on `[4]`, the rest of the list is gone for good. So the one rule behind the whole pattern is: **before you cut a link, make sure something else is holding what is on the other side.**

Five small moves cover nearly every problem:

| Move | Code | What it does |
| --- | --- | --- |
| Walk | `cur = cur.next` | step one node forward |
| Unlink | `prev.next = prev.next.next` | skip over the node after `prev` |
| Insert | `node.next = prev.next` then `prev.next = node` | put `node` right after `prev` |
| Flip | `cur.next = prev` | make a link point backwards |
| Append | `tail.next = node` then `tail = node` | grow an output list at its end |

Two helpers make those moves safe and fast. A **dummy node** sits in front of the real head so the first node is never a special case. **Two pointers moving at different speeds or a fixed distance apart** find positions (the middle, the k-th from the end, the start of a loop) in one pass, because you cannot jump to an index.

## When to reach for it

Signals in the statement:

- The input is a `ListNode` head and you return a head, or the function changes the list and returns nothing.
- "In place", "`O(1)` extra space", "rewire the nodes, don't change the values".
- "Middle", "has a cycle", "n-th from the end": two pointers at different speeds or offsets.
- "Reverse", "reorder", "palindrome", "every `k` nodes": in-place reversal of the whole list or a segment.
- "Sorted lists", "combine", "sort the list": merging with a tail pointer.
- "`O(1)` get and put with eviction by recency": a hash map paired with a doubly linked list.
- An array of `n + 1` values, each a valid index into the array: an implicit linked list where `next(i) = nums[i]`.

Look-alikes that need a different tool:

| Statement says | Why plain pointer work is not enough | Use instead |
| --- | --- | --- |
| Merge `k` sorted lists, `k` large | Picking the smallest of `k` heads by scanning costs `O(k)` per node | A min-heap of heads (or pairwise merging) feeding the same tail |
| Cycle in a graph where nodes have many neighbours | Floyd's trick needs exactly one outgoing edge per node | DFS with visit states, or union-find |
| Find the k-th value, or binary search | Lists have no random access | Copy to an array, or choose a different structure |
| Extra space is allowed and only values matter | Copying to an array is simpler and harder to get wrong | Copy the values, then use two pointers on the array |

Say the last one out loud in an interview: "I could copy into an array in `O(n)` space; the in-place version is..." It shows you know the trade-off.

## How it works

Reversal is the move every other technique leans on, so walk it end to end on `1 -> 2 -> 3`. Keep three fingers: `prev` (head of the part already reversed), `cur` (head of the part not yet touched) and `next` (saved just before the cut).

| step | save `next` | link written | `prev` after | `cur` after | reversed part | untouched part |
| --- | --- | --- | --- | --- | --- | --- |
| start | – | – | `null` | 1 | empty | `1 -> 2 -> 3` |
| 1 | 2 | `1 -> null` | 1 | 2 | `1` | `2 -> 3` |
| 2 | 3 | `2 -> 1` | 2 | 3 | `2 -> 1` | `3` |
| 3 | `null` | `3 -> 2` | 3 | `null` | `3 -> 2 -> 1` | empty |

The **invariant**: at the top of each iteration, the list is split into two separate chains, the reversed part starting at `prev` and the untouched part starting at `cur`. One iteration moves exactly one node from the front of the untouched part to the front of the reversed part. When `cur` is `null`, nothing is left untouched and `prev` is the new head. Each node is visited once and only three variables are used, so the cost is `O(n)` time and `O(1)` space.

The fast/slow technique rests on a similarly short argument. `fast` moves two nodes per step and `slow` moves one. When `fast` has covered the whole list of `n` nodes, `slow` has covered half of it, so `slow` is at the middle. If the list loops, `fast` can never reach `null`. Once both pointers are inside the loop, `fast` gains exactly one node on `slow` per step, so the gap between them shrinks by one each time and cannot skip past zero: they must land on the same node within one lap.

## Templates

### Reverse

```ts
function reverse(head: ListNode | null): ListNode | null {
  let prev: ListNode | null = null
  let cur = head
  while (cur !== null) {
    const next = cur.next // hold the rest before cutting the link
    cur.next = prev
    prev = cur
    cur = next
  }
  return prev
}
```

- The order of the four lines matters: save, flip, advance `prev`, advance `cur`. Swapping the last two loses the node you just flipped.
- Return `prev`, not `cur` (which is `null`) and not `head` (which is now the tail).
- The old `head` now points to `null`. That is what terminates the reversed list, and it is why reversing a segment in the middle needs extra stitching afterwards.

### Dummy head for deletions

```ts
function removeValue(head: ListNode | null, target: number): ListNode | null {
  const dummy = new ListNode(0, head)
  let prev = dummy
  while (prev.next !== null) {
    if (prev.next.val === target) {
      prev.next = prev.next.next // unlink, and stay to inspect the new neighbour
    } else {
      prev = prev.next
    }
  }
  return dummy.next
}
```

- Stand on the node **before** the one you inspect. A singly linked node cannot reach back to fix its predecessor.
- Do not advance after deleting: the new `prev.next` has not been checked yet.
- Return `dummy.next`. If the original head was deleted, `head` points at a node that is no longer in the list.

### Merge two sorted lists with a tail

```ts
function merge(a: ListNode | null, b: ListNode | null): ListNode | null {
  const dummy = new ListNode(0)
  let tail = dummy
  while (a !== null && b !== null) {
    if (a.val <= b.val) {
      tail.next = a
      a = a.next
    } else {
      tail.next = b
      b = b.next
    }
    tail = tail.next
  }
  // At most one list still has nodes, and they are already sorted.
  if (a !== null) {
    tail.next = a
  } else {
    tail.next = b
  }
  return dummy.next
}
```

- `<=` takes from `a` on ties, which keeps the merge stable. Merge sort relies on that.
- Attach the leftover list in one step instead of looping over it.
- No new nodes are allocated; the output is built by relinking.

### Fast and slow

```ts
function middle(head: ListNode | null): ListNode | null {
  let slow = head
  let fast = head
  while (fast !== null && fast.next !== null && slow !== null) {
    slow = slow.next
    fast = fast.next.next
  }
  return slow
}
```

- Check `fast !== null` **before** `fast.next !== null`; the other order crashes on even-length lists. The `slow !== null` check never fails (slow is behind fast) and is only there to satisfy the type checker.
- Starting `fast` at `head` stops `slow` on the **second** middle of an even list. Starting `fast` at `head.next` stops it on the **first** middle, which is what you want when splitting a list into two halves: the left half ends at `slow`, and both halves are strictly shorter than the whole.
- For cycle detection, use the same loop and return `true` as soon as `slow === fast` after moving. Compare nodes, not values: two different nodes can hold the same value.

### Choosing a template

- Building a new list, or the head might change: **dummy plus tail**.
- Deleting nodes: **dummy plus `prev`**.
- Any "backwards" access: **reverse** the part you need to read backwards.
- A position defined relative to the length (middle, end, k from the end): **fast/slow** or a **fixed gap**.
- Combining sorted runs: **merge**.

Harder problems chain them. Reorder List is middle, then reverse, then interleave. Sort List is middle, then recurse, then merge.

## Choosing the pointers

What you hold decides whether a step is `O(1)`:

| Task | Hold | Why |
| --- | --- | --- |
| Delete a node | the node before it | links only go forward |
| Build an output list | `dummy` and `tail` | append in `O(1)` with no head check |
| Reverse a whole list | `prev`, `cur`, saved `next` | never lose the untouched part |
| Reverse a segment | node before it, its first node, node after it | to stitch the reversed segment back in |
| Find the middle or split | `slow` and `fast` | one pass, no length count |
| n-th from the end | `lead` and `follow`, `n` apart | when `lead` ends, `follow` is in place |
| Remove any key in `O(1)` | `Map` from key to node, doubly linked list with a sentinel at each end | a node can unlink itself through its own `prev` |
| Evict by frequency, then recency | `Map` from count to a recency-ordered list, plus the smallest count in use | the victim is the oldest node in the lowest bucket |

**Singly or doubly linked?** Problem inputs are singly linked and you work with what you are given. For your own designs (the caches), use a doubly linked list with two sentinel nodes, `head` and `tail`, that are never removed. Every real node then has non-null neighbours, and insert and remove are four assignments each with no branches.

## Worked problems

**Remove Nth Node From End of List.** To delete a node you need the one before it, and the head itself might be the target, so start both pointers on a dummy. Move `lead` forward `n + 1` times, then move `lead` and `follow` together until `lead` is `null`. The gap of `n + 1` leaves `follow` exactly one node before the target. Unlink with `follow.next = follow.next.next` and return `dummy.next`. The twist is the off-by-one: the extra step is what lands you on the predecessor instead of the target.

**Reorder List.** The output alternates front, back, front, back. Reading from the back of a singly linked list is impossible, so make the back half readable: find the first middle with fast/slow, cut the list after it (`slow.next = null`), reverse the second half, then interleave by taking one node from each half in turn. The second half is never longer than the first, so the loop runs while the second half has nodes. Forgetting the cut leaves the first half's tail still pointing into the reversed half, and you get a cycle.

**LRU Cache.** You need `O(1)` lookup by key and `O(1)` "move to most recent". A `Map` gives the lookup; a doubly linked list with sentinels gives the ordering, most recent next to `head` and least recent next to `tail`. `get` unlinks the node and re-inserts it after `head`. `put` either updates and moves the node, or inserts a new one and, when over capacity, removes `tail.prev` and deletes its key from the map. Store the key inside the node; otherwise you cannot find the map entry to delete on eviction. A JavaScript `Map` iterates in insertion order, so deleting and re-setting a key also works, but interviewers usually want the explicit list.

**Reverse Nodes in k-Group.** Keep `groupPrev`, the node before the current group (a dummy for the first group). From it, walk `k` steps to find the group's last node; if you hit `null` first, the remaining short group stays as it is and you are done. Save `groupNext = last.next`, reverse the `k` nodes using `groupNext` as the stopping point instead of `null`, then stitch: the group's old first node is now its last, so link it to `groupNext`, and point `groupPrev.next` at the old last node. The old first node becomes the next `groupPrev`. The twist is checking the length **before** reversing, so a short tail never needs undoing.

## Variations and tricks

- **Finding where a cycle starts.** After `slow` and `fast` meet, move one pointer back to `head` and step both one node at a time. They meet at the cycle's first node. The reason: if the start is `a` steps from the head and the meeting point is `b` steps past the start in a loop of length `L`, the slow pointer walked `a + b` and the fast one twice that, so `a + b` is a multiple of `L`. Walking `a` more steps from the meeting point therefore lands on the start, which is also `a` steps from the head.
- **An array as a linked list.** In Find the Duplicate Number, treat index `i` as a node with `next = nums[i]`. Two indexes point to the duplicate value, so that value is where the chain enters a loop. Floyd's two phases then find it with `O(1)` space and no writes to the array.
- **Carry walk.** In Add Two Numbers, loop while **either** list has nodes **or** the carry is non-zero, treating a missing node as `0`. The final carry can create one extra node.
- **Split, sort, merge.** Merge sort suits lists: splitting is fast/slow plus one cut, merging is the template above, and no copying is needed. The recursive version uses `O(log n)` stack. A bottom-up version that merges runs of size 1, 2, 4, ... reaches `O(1)` extra space.
- **Merge many lists.** Merging lists in pairs halves the number of lists each round, giving `O(N log k)`. A min-heap of the current heads gives the same bound and works on streams.
- **Restore what you broke.** After reversing the second half to check a palindrome, reverse it back before returning if the caller still owns the list. Interviewers notice.
- **Recursive reversal.** `reverse(head.next)` and then `head.next.next = head`, `head.next = null`. Short, but it uses `O(n)` stack, which can overflow on long lists. Mention it, write the loop.

## Complexity

- Time `O(n)` for one pass of reversal, deletion, middle finding, cycle detection, or merging two lists of total length `n`: each node is visited a constant number of times.
- Space `O(1)` for all of those: only a few pointer variables, and the dummy node is a constant.
- Sort List: `O(n log n)` time, since there are `log n` levels of splitting and each level merges `n` nodes; `O(log n)` stack for the recursive version.
- Merge k lists: `O(N log k)` time for `N` total nodes, `O(k)` for a heap or `O(log k)` stack for recursive pairwise merging.
- LRU and LFU caches: `O(1)` per operation, `O(capacity)` space for the map and nodes.

## Pitfalls

- Overwriting `cur.next` before saving it, which loses the rest of the list.
- Returning `head` after the head may have changed. Return `dummy.next` or the new head from the reversal.
- Forgetting to cut (`slow.next = null`) when splitting, which leaves a cycle or merges into a half you meant to keep separate.
- Checking `fast.next` before `fast`, and crashing with a null access on even-length lists.
- Starting `fast` on `head` when splitting for merge sort: a two-node list never shrinks and the recursion never ends.
- Advancing `prev` right after a deletion and skipping a node that also needed deleting.
- Comparing node values instead of node identity in cycle detection.
- In the caches, not storing the key in the node, or forgetting to update the map when evicting.
- Reversing a k-group before checking that `k` nodes exist.

## Practice ladder

1. [Reverse Linked List](/problems/reverse-linked-list): the three-pointer flip everything else builds on.
2. [Merge Two Sorted Lists](/problems/merge-two-sorted-lists): the dummy and tail for building an output list.
3. [Middle of the Linked List](/problems/middle-of-the-linked-list): fast/slow in its simplest form, and which middle you land on.
4. [Linked List Cycle](/problems/linked-list-cycle): why a faster pointer must catch a slower one inside a loop.
5. [Palindrome Linked List](/problems/palindrome-linked-list): middle plus reversal to read the back half forwards.
6. [Remove Nth Node From End of List](/problems/remove-nth-node-from-end-of-list): a fixed gap between pointers and a dummy for deleting the head.
7. [Reorder List](/problems/reorder-list): chaining middle, cut, reverse and interleave.
8. [Add Two Numbers](/problems/add-two-numbers): walking two lists together with a carry and a dummy tail.
9. [Find the Duplicate Number](/problems/find-the-duplicate-number): Floyd's cycle start on a linked list hidden inside an array.
10. [LRU Cache](/problems/lru-cache): a map plus a doubly linked list with sentinels for `O(1)` recency.
11. [Sort List](/problems/sort-list): merge sort on a list, splitting at the first middle.
12. [Merge k Sorted Lists](/problems/merge-k-sorted-lists): scaling the two-list merge with a heap or pairwise rounds.
13. [Reverse Nodes in k-Group](/problems/reverse-nodes-in-k-group): reversing segments and stitching them back between their neighbours.
14. [LFU Cache](/problems/lfu-cache): frequency buckets of recency lists and a tracked minimum count.
