function addTwoNumbers(l1: ListNode | null, l2: ListNode | null): ListNode | null {
  // Copy both numbers into digit arrays first, add the arrays, then build a list.
  // (Converting to a single number would overflow: inputs have up to 100 digits.)
  const x: number[] = []
  const y: number[] = []
  let current = l1
  while (current !== null) {
    x.push(current.val)
    current = current.next
  }
  current = l2
  while (current !== null) {
    y.push(current.val)
    current = current.next
  }
  const digits: number[] = []
  let carry = 0
  for (let i = 0; i < x.length || i < y.length || carry !== 0; i++) {
    let sum = carry
    if (i < x.length) {
      sum += x[i]
    }
    if (i < y.length) {
      sum += y[i]
    }
    digits.push(sum % 10)
    carry = Math.floor(sum / 10)
  }
  const dummy = new ListNode(0)
  let tail = dummy
  for (let i = 0; i < digits.length; i++) {
    tail.next = new ListNode(digits[i])
    tail = tail.next
  }
  return dummy.next
}
