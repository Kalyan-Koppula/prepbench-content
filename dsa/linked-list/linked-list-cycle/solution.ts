function hasCycle(head: ListNode | null): boolean {
  // Floyd: fast moves two steps per turn, slow one. In a cycle fast gains
  // one node per turn on slow, so it must land on it.
  let slow = head
  let fast = head
  while (slow !== null && fast !== null && fast.next !== null) {
    slow = slow.next
    fast = fast.next.next
    if (slow === fast) {
      return true
    }
  }
  return false // fast reached the end, so there is no cycle
}
