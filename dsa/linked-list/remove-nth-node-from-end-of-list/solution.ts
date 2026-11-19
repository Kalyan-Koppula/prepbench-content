function removeNthFromEnd(head: ListNode | null, n: number): ListNode | null {
  // The dummy makes removing the real head the same as removing any node.
  const dummy = new ListNode(0, head)
  let fast: ListNode = dummy
  let slow: ListNode = dummy
  // Put fast n nodes ahead of slow.
  for (let i = 0; i < n; i++) {
    fast = fast.next as ListNode
  }
  // Move both until fast is on the last node; slow is then just before the target.
  while (fast.next !== null) {
    fast = fast.next
    slow = slow.next as ListNode
  }
  const target = slow.next as ListNode
  slow.next = target.next
  return dummy.next
}
