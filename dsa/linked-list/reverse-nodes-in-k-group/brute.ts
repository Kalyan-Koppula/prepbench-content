function reverseKGroup(head: ListNode | null, k: number): ListNode | null {
  // Collect the nodes, reverse each full block of k in the array, then relink.
  // O(n) extra space.
  const nodes: ListNode[] = []
  let current = head
  while (current !== null) {
    nodes.push(current)
    current = current.next
  }
  for (let start = 0; start + k <= nodes.length; start += k) {
    let i = start
    let j = start + k - 1
    while (i < j) {
      const temp = nodes[i]
      nodes[i] = nodes[j]
      nodes[j] = temp
      i++
      j--
    }
  }
  for (let i = 0; i < nodes.length; i++) {
    if (i + 1 < nodes.length) {
      nodes[i].next = nodes[i + 1]
    } else {
      nodes[i].next = null
    }
  }
  if (nodes.length === 0) {
    return null
  }
  return nodes[0]
}
