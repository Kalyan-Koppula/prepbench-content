function addTwoNumbers(l1: ListNode | null, l2: ListNode | null): ListNode | null {
  const dummy = new ListNode(0)
  let tail = dummy
  let a = l1
  let b = l2
  let carry = 0
  // Digits are stored ones-first, so add from the heads like column addition.
  while (a !== null || b !== null || carry !== 0) {
    let sum = carry
    if (a !== null) {
      sum += a.val
      a = a.next
    }
    if (b !== null) {
      sum += b.val
      b = b.next
    }
    tail.next = new ListNode(sum % 10)
    tail = tail.next
    carry = Math.floor(sum / 10)
  }
  return dummy.next
}
