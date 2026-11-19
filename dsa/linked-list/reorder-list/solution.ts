function reorderList(head: ListNode | null): void {
  if (head === null || head.next === null) {
    return
  }
  // 1. Find the end of the first half and cut the list in two.
  let slow: ListNode = head
  let fast: ListNode = head
  while (fast.next !== null && fast.next.next !== null) {
    slow = slow.next as ListNode
    fast = fast.next.next
  }
  let second = slow.next
  slow.next = null

  // 2. Reverse the second half.
  let prev: ListNode | null = null
  while (second !== null) {
    const next: ListNode | null = second.next
    second.next = prev
    prev = second
    second = next
  }

  // 3. Weave: first, last, second, second-to-last, ...
  let first: ListNode | null = head
  second = prev
  while (first !== null && second !== null) {
    const nextFirst: ListNode | null = first.next
    const nextSecond: ListNode | null = second.next
    first.next = second
    second.next = nextFirst
    first = nextFirst
    second = nextSecond
  }
}
