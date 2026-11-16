function reorderList(head: ListNode | null): void {
  if (!head || !head.next) return

  // 1. Find the end of the first half and cut the list in two
  let slow = head
  let fast = head
  while (fast.next && fast.next.next) {
    slow = slow.next!
    fast = fast.next.next
  }
  let second = slow.next
  slow.next = null

  // 2. Reverse the second half
  let prev: ListNode | null = null
  while (second) {
    const next: ListNode | null = second.next
    second.next = prev
    prev = second
    second = next
  }

  // 3. Interleave: first, last, second, second-to-last, ...
  let first: ListNode | null = head
  second = prev
  while (second) {
    const nextFirst: ListNode | null = first!.next
    const nextSecond: ListNode | null = second.next
    first!.next = second
    second.next = nextFirst
    first = nextFirst
    second = nextSecond
  }
}
