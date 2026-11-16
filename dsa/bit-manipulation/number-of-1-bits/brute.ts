function hammingWeight(n: number): number {
  return n
    .toString(2)
    .split('')
    .filter((b) => b === '1').length
}
