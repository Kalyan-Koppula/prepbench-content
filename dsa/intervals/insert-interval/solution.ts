function insert(intervals: number[][], newInterval: number[]): number[][] {
  const result: number[][] = []
  let [start, end] = newInterval
  let i = 0
  // 1. Ranges entirely to the left.
  while (i < intervals.length && intervals[i][1] < start) result.push(intervals[i++])
  // 2. Ranges that overlap: grow the new interval to cover them.
  while (i < intervals.length && intervals[i][0] <= end) {
    start = Math.min(start, intervals[i][0])
    end = Math.max(end, intervals[i][1])
    i++
  }
  result.push([start, end])
  // 3. Ranges entirely to the right.
  while (i < intervals.length) result.push(intervals[i++])
  return result
}
