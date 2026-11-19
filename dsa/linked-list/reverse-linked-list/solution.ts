function reverseList(head: ListNode | null): ListNode | null {
  let prev: ListNode | null = null // head of the reversed part
  let current = head // head of the part still to reverse
  while (current !== null) {
    const next = current.next // save it before the link is overwritten
    current.next = prev
    prev = current
    current = next
  }
  return prev
}
