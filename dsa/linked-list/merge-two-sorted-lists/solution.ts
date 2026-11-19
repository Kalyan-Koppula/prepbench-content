function mergeTwoLists(list1: ListNode | null, list2: ListNode | null): ListNode | null {
  const dummy = new ListNode(0) // placeholder in front of the result
  let tail = dummy // last node of the merged list so far
  let a = list1
  let b = list2
  while (a !== null && b !== null) {
    // Take the smaller head; <= keeps equal values from list1 first.
    if (a.val <= b.val) {
      tail.next = a
      a = a.next
    } else {
      tail.next = b
      b = b.next
    }
    tail = tail.next
  }
  // At most one list has nodes left, already in order.
  if (a !== null) {
    tail.next = a
  } else {
    tail.next = b
  }
  return dummy.next
}
