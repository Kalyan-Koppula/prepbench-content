// Add the new interval to the list, then merge everything from scratch:
// sort by start and sweep. O(n log n).
function insert(intervals: number[][], newInterval: number[]): number[][] {
  const all: number[][] = []
  for (let i = 0; i < intervals.length; i++) {
    all.push(intervals[i])
  }
  all.push(newInterval)
  all.sort((a, b) => a[0] - b[0])
  const merged: number[][] = []
  for (let i = 0; i < all.length; i++) {
    if (merged.length > 0 && all[i][0] <= merged[merged.length - 1][1]) {
      const last = merged[merged.length - 1]
      if (all[i][1] > last[1]) {
        last[1] = all[i][1]
      }
    } else {
      merged.push([all[i][0], all[i][1]])
    }
  }
  return merged
}
