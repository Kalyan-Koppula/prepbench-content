function middleNode(head: ListNode | null): ListNode | null {
  const nodes: ListNode[] = []
  for (let cur = head; cur; cur = cur.next) nodes.push(cur)
  return nodes[Math.floor(nodes.length / 2)]
}
