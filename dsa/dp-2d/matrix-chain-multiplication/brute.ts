// Simulate every order of multiplying two adjacent matrices, memoised on the
// current list of shapes (small chains only).
function matrixChainOrder(dims: number[]): number {
  const memo = new Map<string, number>()
  const go = (shape: number[]): number => {
    if (shape.length <= 2) return 0
    const key = shape.join(',')
    if (memo.has(key)) return memo.get(key)!
    let best = Infinity
    // Multiply matrices t-1 and t (shapes shape[t-1] x shape[t] and shape[t] x shape[t+1]).
    for (let t = 1; t < shape.length - 1; t++) {
      const merged = [...shape.slice(0, t), ...shape.slice(t + 1)]
      best = Math.min(best, shape[t - 1] * shape[t] * shape[t + 1] + go(merged))
    }
    memo.set(key, best)
    return best
  }
  return go(dims)
}
