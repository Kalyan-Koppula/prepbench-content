function hammingWeight(n: number): number {
  let count = 0
  while (n !== 0) {
    n &= n - 1 // drop the lowest set bit
    count++
  }
  return count
}
