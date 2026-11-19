function removeNthFromEnd(head: ListNode | null, n: number): ListNode | null {
  // Two passes: count the nodes, then walk to the one before the target.
  let length = 0
  let current = head
  while (current !== null) {
    length++
    current = current.next
  }
  const dummy = new ListNode(0, head)
  let before: ListNode = dummy
  for (let i = 0; i < length - n; i++) {
    before = before.next as ListNode
  }
  const target = before.next as ListNode
  before.next = target.next
  return dummy.next
}
