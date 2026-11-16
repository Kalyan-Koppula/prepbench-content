function sortList(head: ListNode | null): ListNode | null {
  if (!head || !head.next) return head

  // Cut after the first middle so a two-node list splits into 1 + 1
  let slow = head
  let fast = head
  while (fast.next && fast.next.next) {
    slow = slow.next!
    fast = fast.next.next
  }
  const right = slow.next
  slow.next = null

  let a = sortList(head)
  let b = sortList(right)
  const dummy = new ListNode()
  let tail = dummy
  while (a && b) {
    if (a.val <= b.val) {
      tail.next = a
      a = a.next
    } else {
      tail.next = b
      b = b.next
    }
    tail = tail.next
  }
  tail.next = a ?? b
  return dummy.next
}
