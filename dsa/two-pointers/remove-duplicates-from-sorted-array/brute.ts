function removeDuplicates(nums: number[]): number[] {
  // Collect the distinct values into a second array, then copy them back.
  // Correct and linear, but it spends O(n) extra space.
  const distinct: number[] = []
  for (let i = 0; i < nums.length; i++) {
    if (distinct.length === 0 || distinct[distinct.length - 1] !== nums[i]) {
      distinct.push(nums[i])
    }
  }
  for (let i = 0; i < distinct.length; i++) {
    nums[i] = distinct[i]
  }
  return nums.slice(0, distinct.length)
}
