function findDuplicate(nums: number[]): number {
  // Read the array as a linked list: index i points to index nums[i].
  // Two indices point to the duplicate value, so the walk from 0 enters a
  // cycle exactly at the duplicate. Floyd's algorithm finds that entrance.
  let slow = nums[0]
  let fast = nums[nums[0]]
  while (slow !== fast) {
    slow = nums[slow]
    fast = nums[nums[fast]]
  }
  // Phase 2: from the start and from the meeting point, one step at a time.
  slow = 0
  while (slow !== fast) {
    slow = nums[slow]
    fast = nums[fast]
  }
  return slow
}
