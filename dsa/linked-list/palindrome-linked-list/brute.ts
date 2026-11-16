function isPalindrome(head: ListNode | null): boolean {
  const values: number[] = []
  for (let cur = head; cur; cur = cur.next) values.push(cur.val)
  return values.join(',') === [...values].reverse().join(',')
}
