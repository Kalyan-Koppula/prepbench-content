function plusOne(digits: number[]): number[] {
  const n = BigInt(digits.join('')) + 1n
  return n.toString().split('').map(Number)
}
