function hasCycle(head: ListNode | null): boolean {
  const seen = new Set<ListNode>()
  for (let cur = head; cur; cur = cur.next) {
    if (seen.has(cur)) return true
    seen.add(cur)
  }
  return false
}
