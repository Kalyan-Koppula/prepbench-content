// Combinatorics: choose which m - 1 of the m + n - 2 moves go down. BigInt keeps it exact.
function uniquePaths(m: number, n: number): number {
  const total = BigInt(m + n - 2)
  const k = BigInt(Math.min(m, n) - 1)
  let result = BigInt(1)
  for (let i = BigInt(1); i <= k; i++) result = (result * (total - k + i)) / i
  return Number(result)
}
