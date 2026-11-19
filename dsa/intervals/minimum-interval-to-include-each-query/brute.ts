// For each query, check every interval. O(n * q).
function minInterval(intervals: number[][], queries: number[]): number[] {
  const answer: number[] = []
  for (let k = 0; k < queries.length; k++) {
    const q = queries[k]
    let best = -1
    for (let i = 0; i < intervals.length; i++) {
      const size = intervals[i][1] - intervals[i][0] + 1
      if (intervals[i][0] <= q && q <= intervals[i][1] && (best === -1 || size < best)) {
        best = size
      }
    }
    answer.push(best)
  }
  return answer
}
