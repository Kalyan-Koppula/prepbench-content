function isPalindrome(head: ListNode | null): boolean {
  // Copy the values to an array and compare from both ends. O(n) extra space.
  const values: number[] = []
  let current = head
  while (current !== null) {
    values.push(current.val)
    current = current.next
  }
  let i = 0
  let j = values.length - 1
  while (i < j) {
    if (values[i] !== values[j]) {
      return false
    }
    i++
    j--
  }
  return true
}
