function singleNumber(nums: number[]): number {
  let acc = 0
  for (const x of nums) acc ^= x // pairs cancel out
  return acc
}
