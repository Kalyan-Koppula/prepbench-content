function singleNumber(nums: number[]): number[] {
  // XOR of everything = a ^ b, because every pair cancels.
  let both = 0
  for (let i = 0; i < nums.length; i++) {
    both ^= nums[i]
  }
  // a and b differ in at least one bit; pick the lowest one.
  // In two's complement, x & -x keeps only the lowest set bit of x.
  const diff = both & -both

  // Split all numbers by that bit: a and b land in different groups,
  // and each pair lands together, so each group XORs to one answer.
  let a = 0
  let b = 0
  for (let i = 0; i < nums.length; i++) {
    if ((nums[i] & diff) !== 0) {
      a ^= nums[i]
    } else {
      b ^= nums[i]
    }
  }
  return [a, b]
}
