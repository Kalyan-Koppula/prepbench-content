// DP: a set of jobs can all be scheduled exactly when, sorted by deadline,
// the k-th job has deadline >= k. best[k] = most profit from a feasible set of k jobs.
function jobSequencing(deadline: number[], profit: number[]): number[] {
  const n = deadline.length
  const order: number[] = []
  for (let i = 0; i < n; i++) {
    order.push(i)
  }
  order.sort((a, b) => deadline[a] - deadline[b])
  const best = new Array(n + 1).fill(-Infinity)
  best[0] = 0
  for (let idx = 0; idx < n; idx++) {
    const job = order[idx]
    const limit = Math.min(deadline[job], n)
    for (let k = limit; k >= 1; k--) {
      // Job becomes the k-th scheduled job (its deadline is >= k).
      if (best[k - 1] !== -Infinity && best[k - 1] + profit[job] > best[k]) {
        best[k] = best[k - 1] + profit[job]
      }
    }
  }
  // Most profit; among equal profits, the most jobs.
  let count = 0
  for (let k = 1; k <= n; k++) {
    if (best[k] >= best[count]) {
      count = k
    }
  }
  return [count, best[count]]
}
