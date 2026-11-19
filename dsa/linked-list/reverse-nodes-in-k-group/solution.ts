function reverseKGroup(head: ListNode | null, k: number): ListNode | null {
  const dummy = new ListNode(0, head)
  let groupPrev: ListNode = dummy // node just before the current group
  while (true) {
    // Find the k-th node of this group; stop if fewer than k remain.
    let kth: ListNode | null = groupPrev
    for (let i = 0; i < k && kth !== null; i++) {
      kth = kth.next
    }
    if (kth === null) {
      break
    }
    const groupNext = kth.next // first node after the group

    // Reverse the group. Starting prev at groupNext makes the old first node
    // point at groupNext once it becomes the group's last node.
    let prev: ListNode | null = groupNext
    let current = groupPrev.next
    while (current !== groupNext && current !== null) {
      const next: ListNode | null = current.next
      current.next = prev
      prev = current
      current = next
    }

    const oldFirst = groupPrev.next as ListNode // now the group's last node
    groupPrev.next = kth // kth is now the group's first node
    groupPrev = oldFirst
  }
  return dummy.next
}
