function hasCycle(head: ListNode | null): boolean {
  // Remember every node visited; seeing one again means a cycle.
  const seen = new Set<ListNode>()
  let current = head
  while (current !== null) {
    if (seen.has(current)) {
      return true
    }
    seen.add(current)
    current = current.next
  }
  return false
}
