function mergeTwoLists(list1: ListNode | null, list2: ListNode | null): ListNode | null {
  // Copy every value out, sort, and build a new list. Ignores that inputs are sorted.
  const values: number[] = []
  let current = list1
  while (current !== null) {
    values.push(current.val)
    current = current.next
  }
  current = list2
  while (current !== null) {
    values.push(current.val)
    current = current.next
  }
  values.sort((x, y) => x - y)
  const dummy = new ListNode(0)
  let tail = dummy
  for (let i = 0; i < values.length; i++) {
    tail.next = new ListNode(values[i])
    tail = tail.next
  }
  return dummy.next
}
