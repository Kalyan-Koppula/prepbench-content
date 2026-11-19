function isHappy(n: number): boolean {
  // Floyd's cycle detection: `fast` moves two steps for each step of `slow`.
  let slow = n
  let fast = digitSquareSum(n)
  while (fast !== 1 && slow !== fast) {
    slow = digitSquareSum(slow)
    fast = digitSquareSum(digitSquareSum(fast))
  }
  return fast === 1
}

function digitSquareSum(x: number): number {
  let sum = 0
  while (x > 0) {
    const digit = x % 10
    sum += digit * digit
    x = Math.floor(x / 10)
  }
  return sum
}
