function mergeKLists(lists: Array<ListNode | null>): ListNode | null {
  // A min-heap holds the current head of every non-empty list.
  const heap = new PriorityQueue<ListNode>((a, b) => a.val - b.val)
  for (let i = 0; i < lists.length; i++) {
    const head = lists[i]
    if (head !== null) {
      heap.push(head)
    }
  }
  const dummy = new ListNode(0)
  let tail = dummy
  while (!heap.isEmpty()) {
    const node = heap.pop() as ListNode // the smallest remaining node overall
    tail.next = node
    tail = node
    if (node.next !== null) {
      heap.push(node.next) // its successor is now that list's front
    }
  }
  tail.next = null
  return dummy.next
}
