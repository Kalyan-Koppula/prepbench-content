function reorderList(head: ListNode | null): void {
  const nodes: ListNode[] = []
  for (let cur = head; cur; cur = cur.next) nodes.push(cur)
  const order: ListNode[] = []
  for (let i = 0, j = nodes.length - 1; i <= j; i++, j--) {
    order.push(nodes[i])
    if (i !== j) order.push(nodes[j])
  }
  for (let k = 0; k < order.length; k++) order[k].next = order[k + 1] ?? null
}
