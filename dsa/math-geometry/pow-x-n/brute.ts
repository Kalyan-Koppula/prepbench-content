// Recursive halving: x^n = (x^(n/2))^2, times x when n is odd.
function myPow(x: number, n: number): number {
  if (n < 0) {
    return 1 / powerOf(x, -n)
  }
  return powerOf(x, n)
}

function powerOf(x: number, n: number): number {
  if (n === 0) {
    return 1
  }
  const half = powerOf(x, Math.floor(n / 2))
  if (n % 2 === 0) {
    return half * half
  }
  return half * half * x
}
