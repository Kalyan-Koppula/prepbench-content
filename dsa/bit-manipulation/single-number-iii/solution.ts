function singleNumber(nums: number[]): number[] {
  let both = 0
  for (const x of nums) both ^= x // = a ^ b

  // Lowest bit where a and b differ. Works even for -2^31 under 32-bit coercion.
  const diff = both & -both

  let a = 0
  let b = 0
  for (const x of nums) {
    if (x & diff) a ^= x
    else b ^= x
  }
  return [a, b]
}
