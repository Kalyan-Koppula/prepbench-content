function matrixChainOrder(dims: number[]): number {
  const n = dims.length - 1 // matrix i has shape dims[i] x dims[i + 1]
  // cost[i][j] = fewest scalar multiplications to multiply matrices i..j.
  const cost: number[][] = []
  for (let i = 0; i < n; i++) {
    cost.push(new Array(n).fill(0)) // a single matrix costs 0
  }
  for (let length = 2; length <= n; length++) {
    for (let i = 0; i + length - 1 < n; i++) {
      const j = i + length - 1
      cost[i][j] = Infinity
      for (let k = i; k < j; k++) {
        // Split after matrix k: (i..k) is dims[i] x dims[k + 1],
        // (k + 1..j) is dims[k + 1] x dims[j + 1]; multiplying them costs the product.
        const total = cost[i][k] + cost[k + 1][j] + dims[i] * dims[k + 1] * dims[j + 1]
        if (total < cost[i][j]) {
          cost[i][j] = total
        }
      }
    }
  }
  return cost[0][n - 1]
}
