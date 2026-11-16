// Count sequences directly: choose how many 2-steps (k) and where they go among n - k moves.
function climbStairs(n: number): number {
  const choose = (a: number, b: number) => {
    let r = 1
    for (let i = 1; i <= b; i++) r = (r * (a - b + i)) / i
    return Math.round(r)
  }
  let total = 0
  for (let k = 0; 2 * k <= n; k++) total += choose(n - k, k)
  return total
}
