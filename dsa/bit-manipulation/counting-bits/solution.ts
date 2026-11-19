function countBits(n: number): number[] {
  const bits = new Array(n + 1).fill(0)
  for (let i = 1; i <= n; i++) {
    // i >> 1 is i with its lowest bit removed, and it is smaller than i,
    // so its count is already known. Add back the lowest bit (i & 1).
    bits[i] = bits[i >> 1] + (i & 1)
  }
  return bits
}
