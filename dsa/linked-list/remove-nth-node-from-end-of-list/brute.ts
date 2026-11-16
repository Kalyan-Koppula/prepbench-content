function removeNthFromEnd(head: ListNode | null, n: number): ListNode | null {
  const values: number[] = []
  for (let cur = head; cur; cur = cur.next) values.push(cur.val)
  values.splice(values.length - n, 1)
  const dummy = new ListNode()
  let tail = dummy
  for (const v of values) tail = tail.next = new ListNode(v)
  return dummy.next
}
