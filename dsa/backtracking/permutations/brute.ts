function permute(nums: number[]): number[][] {
  // Permute the tail, then insert the head at every position.
  if (nums.length === 0) return [[]]
  const [head, ...tail] = nums
  const result: number[][] = []
  for (const p of permute(tail)) {
    for (let pos = 0; pos <= p.length; pos++) result.push([...p.slice(0, pos), head, ...p.slice(pos)])
  }
  return result
}
