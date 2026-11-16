function findMaximumXOR(nums: number[]): number {
  let best = 0
  for (let i = 0; i < nums.length; i++)
    for (let j = i + 1; j < nums.length; j++) best = Math.max(best, nums[i] ^ nums[j])
  return best
}
