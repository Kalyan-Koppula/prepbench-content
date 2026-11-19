function sortList(head: ListNode | null): ListNode | null {
  // Insertion sort on the list: O(n^2) time, O(1) space.
  const dummy = new ListNode(0)
  let current = head
  while (current !== null) {
    const next = current.next
    // Find the last node in the sorted part whose value is <= current.val.
    let spot = dummy
    while (spot.next !== null && spot.next.val <= current.val) {
      spot = spot.next
    }
    current.next = spot.next
    spot.next = current
    current = next
  }
  return dummy.next
}
