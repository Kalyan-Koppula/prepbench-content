function eraseOverlapIntervals(intervals: number[][]): number {
  const sorted = [...intervals].sort((a, b) => a[1] - b[1])
  let kept = 0
  let lastEnd = -Infinity
  for (const [start, end] of sorted) {
    // Earliest-ending compatible interval is always a safe choice.
    if (start >= lastEnd) {
      kept++
      lastEnd = end
    }
  }
  return intervals.length - kept
}
