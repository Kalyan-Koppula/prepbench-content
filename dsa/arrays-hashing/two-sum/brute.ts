function twoSum(nums: number[], target: number): number[] {
  for (let i = 0; i < nums.length; i++) {
    // Start j after i: each unordered pair is tried once, never i with itself.
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) {
        return [i, j]
      }
    }
  }
  return []
}
