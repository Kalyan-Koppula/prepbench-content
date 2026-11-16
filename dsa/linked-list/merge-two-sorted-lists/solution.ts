function mergeTwoLists(list1: ListNode | null, list2: ListNode | null): ListNode | null {
  const dummy = new ListNode()
  let tail = dummy
  let a = list1
  let b = list2
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
