function mergeKLists(lists: Array<ListNode | null>): ListNode | null {
  const heap = new PriorityQueue<ListNode>((a, b) => a.val - b.val)
  for (const head of lists) if (head) heap.push(head)

  const dummy = new ListNode()
  let tail = dummy
  while (!heap.isEmpty()) {
    const node = heap.pop()!
    tail.next = node
    tail = node
    if (node.next) heap.push(node.next)
  }
  tail.next = null
  return dummy.next
}
