function mergeTwo(a: ListNode | null, b: ListNode | null): ListNode | null {
  const dummy = new ListNode(0)
  let tail = dummy
  let x = a
  let y = b
  while (x !== null && y !== null) {
    if (x.val <= y.val) {
      tail.next = x
      x = x.next
    } else {
      tail.next = y
      y = y.next
    }
    tail = tail.next
  }
  if (x !== null) {
    tail.next = x
  } else {
    tail.next = y
  }
  return dummy.next
}

function mergeKLists(lists: Array<ListNode | null>): ListNode | null {
  // Merge the lists into the result one at a time: O(k * N).
  let result: ListNode | null = null
  for (let i = 0; i < lists.length; i++) {
    result = mergeTwo(result, lists[i])
  }
  return result
}
