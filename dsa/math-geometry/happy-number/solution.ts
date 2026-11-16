function isHappy(n: number): boolean {
  const next = (x: number): number => {
    let sum = 0
    while (x > 0) {
      const d = x % 10
      sum += d * d
      x = Math.floor(x / 10)
    }
    return sum
  }
  // Floyd's cycle detection: fast moves two steps per slow step.
  let slow = n
  let fast = next(n)
  while (fast !== 1 && slow !== fast) {
    slow = next(slow)
    fast = next(next(fast))
  }
  return fast === 1
}
