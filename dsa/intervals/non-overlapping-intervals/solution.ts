function eraseOverlapIntervals(intervals: number[][]): number {
  const sorted: number[][] = []
  for (let i = 0; i < intervals.length; i++) {
    sorted.push(intervals[i])
  }
  sorted.sort((a, b) => a[1] - b[1]) // by END time
  let kept = 0
  let lastEnd = -Infinity
  for (let i = 0; i < sorted.length; i++) {
    // Keeping the interval that ends earliest leaves the most room for the rest.
    if (sorted[i][0] >= lastEnd) {
      kept++
      lastEnd = sorted[i][1]
    }
  }
  return intervals.length - kept
}
