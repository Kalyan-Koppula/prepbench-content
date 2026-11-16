function mergeKLists(lists: Array<ListNode | null>): ListNode | null {
  const values: number[] = []
  for (const head of lists) for (let cur = head; cur; cur = cur.next) values.push(cur.val)
  values.sort((x, y) => x - y)
  const dummy = new ListNode()
  let tail = dummy
  for (const v of values) tail = tail.next = new ListNode(v)
  return dummy.next
}
