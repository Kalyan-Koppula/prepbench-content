function isPalindrome(head: ListNode | null): boolean {
  if (!head) return true
  // slow ends on the last node of the first half
  let slow = head
  let fast = head
  while (fast.next && fast.next.next) {
    slow = slow.next!
    fast = fast.next.next
  }

  const reverse = (node: ListNode | null) => {
    let prev: ListNode | null = null
    while (node) {
      const next = node.next
      node.next = prev
      prev = node
      node = next
    }
    return prev
  }

  const secondHead = reverse(slow.next)
  let ok = true
  for (let a: ListNode | null = head, b = secondHead; b; a = a!.next, b = b.next) {
    if (a!.val !== b.val) {
      ok = false
      break
    }
  }
  slow.next = reverse(secondHead) // restore the input
  return ok
}
