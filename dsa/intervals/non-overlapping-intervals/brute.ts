// DP like longest increasing subsequence: sort by start, then
// most[i] = the largest compatible set whose last interval is i. O(n^2).
function eraseOverlapIntervals(intervals: number[][]): number {
  const sorted: number[][] = []
  for (let i = 0; i < intervals.length; i++) {
    sorted.push(intervals[i])
  }
  sorted.sort((a, b) => {
    if (a[0] !== b[0]) {
      return a[0] - b[0]
    }
    return a[1] - b[1]
  })
  const n = sorted.length
  const most = new Array(n).fill(1)
  let best = 0
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < i; j++) {
      if (sorted[j][1] <= sorted[i][0] && most[j] + 1 > most[i]) {
        most[i] = most[j] + 1
      }
    }
    if (most[i] > best) {
      best = most[i]
    }
  }
  return n - best
}
