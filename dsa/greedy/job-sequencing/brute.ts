function jobSequencing(deadline: number[], profit: number[]): number[] {
  // DP: a set of jobs is feasible iff, sorted by deadline, the k-th has deadline >= k.
  const n = deadline.length
  const order = [...Array(n).keys()].sort((a, b) => deadline[a] - deadline[b])
  const best: number[] = new Array(n + 1).fill(-Infinity) // best[k] = max profit using k jobs
  best[0] = 0
  for (const j of order) {
    for (let k = Math.min(deadline[j], n); k >= 1; k--) {
      if (best[k - 1] !== -Infinity) best[k] = Math.max(best[k], best[k - 1] + profit[j])
    }
  }
  let count = 0
  for (let k = 1; k <= n; k++) if (best[k] >= best[count]) count = k
  return [count, best[count]]
}
