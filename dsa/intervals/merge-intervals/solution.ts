function merge(intervals: number[][]): number[][] {
  const sorted: number[][] = []
  for (let i = 0; i < intervals.length; i++) {
    sorted.push(intervals[i])
  }
  sorted.sort((a, b) => a[0] - b[0]) // by start
  const merged: number[][] = []
  for (let i = 0; i < sorted.length; i++) {
    const start = sorted[i][0]
    const end = sorted[i][1]
    if (merged.length > 0 && start <= merged[merged.length - 1][1]) {
      // Overlaps the last merged interval: extend it (never shrink it).
      const last = merged[merged.length - 1]
      if (end > last[1]) {
        last[1] = end
      }
    } else {
      merged.push([start, end])
    }
  }
  return merged
}
