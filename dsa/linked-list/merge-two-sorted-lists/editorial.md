**Key insight:** like the merge step of merge sort — repeatedly detach the smaller head and attach it to a growing tail. A dummy node avoids special-casing the first pick.

## Approach

1. `dummy = new ListNode()`, `tail = dummy`.
2. While both lists are non-empty, link `tail.next` to the smaller head, advance that list, advance `tail`.
3. One list is now empty; attach the other in one step: `tail.next = list1 ?? list2`.
4. Return `dummy.next`.

Taking from `list1` on ties (`<=`) keeps the merge stable — worth mentioning, rarely required.

## Complexity

- Time `O(m + n)` — every node is visited once.
- Space `O(1)` — only pointers are rewired.

## Alternatives to mention

- Recursive: `if (a.val <= b.val) { a.next = merge(a.next, b); return a }`. Elegant, but `O(m + n)` stack depth — can overflow for long lists.
- Collect values, sort, rebuild: `O((m + n) log(m + n))` and allocates new nodes. Mention only as a baseline.

## Pitfalls

- Forgetting to attach the leftover tail and losing the rest of one list.
- Returning `dummy` instead of `dummy.next`.
