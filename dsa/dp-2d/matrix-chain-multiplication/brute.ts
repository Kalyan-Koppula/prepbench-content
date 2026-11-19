// Top-down: try every split point, memoised on (i, j).
function matrixChainOrder(dims: number[]): number {
  const n = dims.length - 1
  const memo: number[][] = []
  for (let i = 0; i < n; i++) {
    memo.push(new Array(n).fill(-1))
  }
  return cheapest(dims, 0, n - 1, memo)
}

function cheapest(dims: number[], i: number, j: number, memo: number[][]): number {
  if (i === j) {
    return 0
  }
  if (memo[i][j] !== -1) {
    return memo[i][j]
  }
  let best = Infinity
  for (let k = i; k < j; k++) {
    const total = cheapest(dims, i, k, memo) + cheapest(dims, k + 1, j, memo) + dims[i] * dims[k + 1] * dims[j + 1]
    if (total < best) {
      best = total
    }
  }
  memo[i][j] = best
  return best
}
