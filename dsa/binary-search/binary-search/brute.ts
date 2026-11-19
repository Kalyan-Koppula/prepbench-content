function search(nums: number[], target: number): number {
  // Linear scan: O(n), ignores the sorted order.
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] === target) {
      return i
    }
  }
  return -1
}
