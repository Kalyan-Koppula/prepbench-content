function findDuplicate(nums: number[]): number {
  // Treat i -> nums[i] as a linked list starting at index 0
  let slow = nums[0]
  let fast = nums[0]
  do {
    slow = nums[slow]
    fast = nums[nums[fast]]
  } while (slow !== fast)

  // Restart one pointer; they meet at the cycle entrance (the duplicate)
  slow = nums[0]
  while (slow !== fast) {
    slow = nums[slow]
    fast = nums[fast]
  }
  return slow
}
