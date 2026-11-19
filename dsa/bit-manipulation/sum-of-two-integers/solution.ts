function getSum(a: number, b: number): number {
  while (b !== 0) {
    const carry = (a & b) << 1 // where both bits are 1, a carry moves one place left
    a = a ^ b // the sum of each bit position, ignoring carries
    b = carry // add the carries in the next round
  }
  return a
}
