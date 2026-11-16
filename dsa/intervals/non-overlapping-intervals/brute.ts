function eraseOverlapIntervals(intervals: number[][]): number {
  // DP: best[i] = most compatible intervals ending with interval i (sorted by start).
  const sorted = [...intervals].sort((a, b) => a[0] - b[0] || a[1] - b[1])
  const n = sorted.length
  const best = new Array(n).fill(1)
  let most = 0
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < i; j++) if (sorted[j][1] <= sorted[i][0]) best[i] = Math.max(best[i], best[j] + 1)
    most = Math.max(most, best[i])
  }
  return n - most
}
