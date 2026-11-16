function fourSum(nums: number[], target: number): number[][] {
  const found = new Map<string, number[]>()
  const n = nums.length
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++)
      for (let k = j + 1; k < n; k++)
        for (let m = k + 1; m < n; m++)
          if (nums[i] + nums[j] + nums[k] + nums[m] === target) {
            const t = [nums[i], nums[j], nums[k], nums[m]].sort((x, y) => x - y)
            found.set(t.join(','), t)
          }
  return [...found.values()]
}
