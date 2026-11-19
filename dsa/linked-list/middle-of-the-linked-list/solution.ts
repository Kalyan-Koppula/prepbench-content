function middleNode(head: ListNode | null): ListNode | null {
  // fast moves two steps for every one step of slow.
  // When fast runs off the end, slow is halfway.
  let slow = head
  let fast = head
  while (slow !== null && fast !== null && fast.next !== null) {
    slow = slow.next
    fast = fast.next.next
  }
  return slow
}
