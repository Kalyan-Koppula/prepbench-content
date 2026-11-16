function missingNumber(nums: number[]): number {
  const present = new Set(nums)
  for (let v = 0; v <= nums.length; v++) if (!present.has(v)) return v
  return -1
}
