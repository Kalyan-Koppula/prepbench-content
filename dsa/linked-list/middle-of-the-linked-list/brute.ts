function middleNode(head: ListNode | null): ListNode | null {
  // Count the nodes, then walk to index floor(count / 2).
  let count = 0
  let current = head
  while (current !== null) {
    count++
    current = current.next
  }
  current = head
  for (let i = 0; i < Math.floor(count / 2); i++) {
    if (current !== null) {
      current = current.next
    }
  }
  return current
}
