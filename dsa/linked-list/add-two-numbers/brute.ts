function addTwoNumbers(l1: ListNode | null, l2: ListNode | null): ListNode | null {
  const toBig = (node: ListNode | null) => {
    const digits: number[] = []
    for (let cur = node; cur; cur = cur.next) digits.push(cur.val)
    return BigInt(digits.reverse().join(''))
  }
  const digits = (toBig(l1) + toBig(l2)).toString().split('').reverse()
  const dummy = new ListNode()
  let tail = dummy
  for (const d of digits) tail = tail.next = new ListNode(Number(d))
  return dummy.next
}
