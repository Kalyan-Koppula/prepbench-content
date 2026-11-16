function reverseKGroup(head: ListNode | null, k: number): ListNode | null {
  const dummy = new ListNode(0, head)
  let groupPrev = dummy
  for (;;) {
    // Find the k-th node of this group; stop if the group is short
    let kth: ListNode | null = groupPrev
    for (let i = 0; i < k && kth; i++) kth = kth.next
    if (!kth) break
    const groupNext = kth.next

    // Reverse the group; its old first node ends up pointing at groupNext
    let prev: ListNode | null = groupNext
    let cur = groupPrev.next
    while (cur !== groupNext) {
      const next: ListNode | null = cur!.next
      cur!.next = prev
      prev = cur
      cur = next
    }

    const first = groupPrev.next!
    groupPrev.next = kth
    groupPrev = first
  }
  return dummy.next
}
