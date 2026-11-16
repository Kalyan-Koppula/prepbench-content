function countBits(n: number): number[] {
  const bits: number[] = new Array(n + 1).fill(0)
  for (let i = 1; i <= n; i++) {
    // i >> 1 is i without its lowest bit, already computed.
    bits[i] = bits[i >> 1] + (i & 1)
  }
  return bits
}
