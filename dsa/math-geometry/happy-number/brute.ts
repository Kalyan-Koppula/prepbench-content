// Remember every number seen; a repeat means we are in a cycle that misses 1.
function isHappy(n: number): boolean {
  const seen = new Set<number>()
  while (n !== 1 && !seen.has(n)) {
    seen.add(n)
    let sum = 0
    let x = n
    while (x > 0) {
      const digit = x % 10
      sum += digit * digit
      x = Math.floor(x / 10)
    }
    n = sum
  }
  return n === 1
}
