function getSum(a: number, b: number): number {
  while (b !== 0) {
    const carry = (a & b) << 1 // positions where both bits are 1 carry left
    a = a ^ b // sum ignoring carries
    b = carry
  }
  return a
}
