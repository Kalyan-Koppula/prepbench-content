function mergeTwoLists(list1: ListNode | null, list2: ListNode | null): ListNode | null {
  const values: number[] = []
  for (let cur = list1; cur; cur = cur.next) values.push(cur.val)
  for (let cur = list2; cur; cur = cur.next) values.push(cur.val)
  values.sort((x, y) => x - y)
  const dummy = new ListNode()
  let tail = dummy
  for (const v of values) tail = tail.next = new ListNode(v)
  return dummy.next
}
