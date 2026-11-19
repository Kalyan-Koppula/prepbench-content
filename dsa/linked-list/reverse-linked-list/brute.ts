function reverseList(head: ListNode | null): ListNode | null {
  // Recursive version: reverse the rest, then hang this node at its end.
  if (head === null || head.next === null) {
    return head
  }
  const newHead = reverseList(head.next)
  head.next.next = head // the old second node now points back to head
  head.next = null
  return newHead
}
