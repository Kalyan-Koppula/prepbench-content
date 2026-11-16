function maxSlidingWindow(nums: number[], k: number): number[] {
  const result: number[] = []
  for (let i = 0; i + k <= nums.length; i++) result.push(Math.max(...nums.slice(i, i + k)))
  return result
}
