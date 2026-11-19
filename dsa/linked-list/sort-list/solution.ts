function mergeSorted(a: ListNode | null, b: ListNode | null): ListNode | null {
  const dummy = new ListNode(0)
  let tail = dummy
  let x = a
  let y = b
  while (x !== null && y !== null) {
    if (x.val <= y.val) {
      tail.next = x
      x = x.next
    } else {
      tail.next = y
      y = y.next
    }
    tail = tail.next
  }
  if (x !== null) {
    tail.next = x
  } else {
    tail.next = y
  }
  return dummy.next
}

function sortList(head: ListNode | null): ListNode | null {
  if (head === null || head.next === null) {
    return head
  }
  // Split after the first middle, so a two-node list becomes 1 + 1.
  let slow: ListNode = head
  let fast: ListNode = head
  while (fast.next !== null && fast.next.next !== null) {
    slow = slow.next as ListNode
    fast = fast.next.next
  }
  const right = slow.next
  slow.next = null
  // Sort each half, then merge them.
  return mergeSorted(sortList(head), sortList(right))
}
