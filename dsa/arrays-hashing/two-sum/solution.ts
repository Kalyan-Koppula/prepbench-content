function twoSum(nums: number[], target: number): number[] {
  // value -> index of a position already visited
  const indexOf = new Map<number, number>()
  for (let i = 0; i < nums.length; i++) {
    const partner = target - nums[i]
    const partnerIndex = indexOf.get(partner)
    if (partnerIndex !== undefined) {
      return [partnerIndex, i]
    }
    // Store after the lookup, so an element can never pair with itself.
    indexOf.set(nums[i], i)
  }
  return []
}
