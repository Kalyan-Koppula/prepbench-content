function containsDuplicate(nums: number[]): boolean {
  const seen = new Set<number>()
  for (let i = 0; i < nums.length; i++) {
    if (seen.has(nums[i])) {
      return true // stop at the first repeat
    }
    seen.add(nums[i])
  }
  return false
}
