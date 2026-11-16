function majorityElement(nums: number[]): number {
  for (const x of nums) {
    let c = 0
    for (const y of nums) if (y === x) c++
    if (c > nums.length / 2) return x
  }
  return -1
}
