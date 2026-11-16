function reverseKGroup(head: ListNode | null, k: number): ListNode | null {
  const values: number[] = []
  for (let cur = head; cur; cur = cur.next) values.push(cur.val)
  const out: number[] = []
  for (let i = 0; i < values.length; i += k) {
    const chunk = values.slice(i, i + k)
    out.push(...(chunk.length === k ? chunk.reverse() : chunk))
  }
  const dummy = new ListNode()
  let tail = dummy
  for (const v of out) tail = tail.next = new ListNode(v)
  return dummy.next
}
