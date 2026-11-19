function majorityElement(nums: number[]): number[] {
  // Count with a map: O(n) time but O(n) extra space.
  const freq = new Map<number, number>()
  for (let i = 0; i < nums.length; i++) {
    const seen = freq.get(nums[i])
    if (seen === undefined) {
      freq.set(nums[i], 1)
    } else {
      freq.set(nums[i], seen + 1)
    }
  }
  const threshold = Math.floor(nums.length / 3)
  const result: number[] = []
  for (const entry of freq.entries()) {
    if (entry[1] > threshold) {
      result.push(entry[0])
    }
  }
  return result
}
