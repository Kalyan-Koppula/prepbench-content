function reorderList(head: ListNode | null): void {
  // Put the nodes in an array, then link them from both ends inward. O(n) space.
  const nodes: ListNode[] = []
  let current = head
  while (current !== null) {
    nodes.push(current)
    current = current.next
  }
  let i = 0
  let j = nodes.length - 1
  while (i < j) {
    nodes[i].next = nodes[j]
    i++
    if (i === j) {
      break
    }
    nodes[j].next = nodes[i]
    j--
  }
  nodes[i].next = null // the middle node is the new tail
}
