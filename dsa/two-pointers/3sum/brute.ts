function threeSum(nums: number[]): number[][] {
  const found = new Map<string, number[]>()
  for (let i = 0; i < nums.length; i++)
    for (let j = i + 1; j < nums.length; j++)
      for (let k = j + 1; k < nums.length; k++)
        if (nums[i] + nums[j] + nums[k] === 0) {
          const t = [nums[i], nums[j], nums[k]].sort((x, y) => x - y)
          found.set(t.join(','), t)
        }
  return [...found.values()]
}
