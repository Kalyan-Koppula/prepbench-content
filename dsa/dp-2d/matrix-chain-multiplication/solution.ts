function matrixChainOrder(dims: number[]): number {
  const n = dims.length - 1 // number of matrices
  // cost[i][j] = cheapest way to multiply matrices i..j (inclusive).
  const cost: number[][] = Array.from({ length: n }, () => new Array(n).fill(0))

  for (let len = 2; len <= n; len++) {
    for (let i = 0; i + len - 1 < n; i++) {
      const j = i + len - 1
      cost[i][j] = Infinity
      for (let k = i; k < j; k++) {
        // Last multiplication: (i..k) is dims[i] x dims[k+1], (k+1..j) is dims[k+1] x dims[j+1].
        const c = cost[i][k] + cost[k + 1][j] + dims[i] * dims[k + 1] * dims[j + 1]
        if (c < cost[i][j]) cost[i][j] = c
      }
    }
  }
  return cost[0][n - 1]
}
