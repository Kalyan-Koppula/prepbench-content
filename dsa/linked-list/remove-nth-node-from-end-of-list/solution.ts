function removeNthFromEnd(head: ListNode | null, n: number): ListNode | null {
  const dummy = new ListNode(0, head)
  let fast: ListNode = dummy
  let slow: ListNode = dummy
  for (let i = 0; i < n; i++) fast = fast.next!
  // Keep the n-node gap until fast is on the last node
  while (fast.next) {
    fast = fast.next
    slow = slow.next!
  }
  slow.next = slow.next!.next
  return dummy.next
}
