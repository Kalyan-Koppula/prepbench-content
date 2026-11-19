// Count the set bits of every number separately, clearing the lowest bit each time.
function countBits(n: number): number[] {
  const result: number[] = []
  for (let i = 0; i <= n; i++) {
    let x = i
    let count = 0
    while (x !== 0) {
      x = x & (x - 1)
      count++
    }
    result.push(count)
  }
  return result
}
