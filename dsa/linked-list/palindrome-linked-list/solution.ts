function reverseFrom(node: ListNode | null): ListNode | null {
  let prev: ListNode | null = null
  let current = node
  while (current !== null) {
    const next = current.next
    current.next = prev
    prev = current
    current = next
  }
  return prev
}

function isPalindrome(head: ListNode | null): boolean {
  if (head === null || head.next === null) {
    return true
  }
  // 1. Find the end of the first half (the first middle for even lengths).
  let slow: ListNode = head
  let fast: ListNode = head
  while (fast.next !== null && fast.next.next !== null) {
    slow = slow.next as ListNode
    fast = fast.next.next
  }

  // 2. Reverse the second half and compare it with the first.
  const secondHead = reverseFrom(slow.next)
  let left: ListNode | null = head
  let right = secondHead
  let result = true
  while (left !== null && right !== null) {
    if (left.val !== right.val) {
      result = false
      break
    }
    left = left.next
    right = right.next
  }

  // 3. Restore the list so the caller's input is unchanged.
  slow.next = reverseFrom(secondHead)
  return result
}
