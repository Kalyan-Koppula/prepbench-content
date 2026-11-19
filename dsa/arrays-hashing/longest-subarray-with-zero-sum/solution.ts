function longestZeroSumSubarray(nums: number[]): number {
  // firstIndex[s] = the earliest index where the prefix sum was s.
  const firstIndex = new Map<number, number>()
  firstIndex.set(0, -1) // the empty prefix ends just before index 0
  let sum = 0
  let best = 0

  for (let i = 0; i < nums.length; i++) {
    sum += nums[i]
    const earlier = firstIndex.get(sum)
    if (earlier !== undefined) {
      // Equal prefix sums mean nums[earlier + 1 .. i] sums to zero.
      if (i - earlier > best) {
        best = i - earlier
      }
    } else {
      // Store only the first sighting: a later one could only give a shorter subarray.
      firstIndex.set(sum, i)
    }
  }
  return best
}
