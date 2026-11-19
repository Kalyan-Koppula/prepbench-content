function insert(intervals: number[][], newInterval: number[]): number[][] {
  const result: number[][] = []
  let start = newInterval[0]
  let end = newInterval[1]
  let i = 0
  // 1. Intervals that end before the new one starts: copy them.
  while (i < intervals.length && intervals[i][1] < start) {
    result.push(intervals[i])
    i++
  }
  // 2. Intervals that overlap the new one: absorb them.
  while (i < intervals.length && intervals[i][0] <= end) {
    start = Math.min(start, intervals[i][0])
    end = Math.max(end, intervals[i][1])
    i++
  }
  result.push([start, end])
  // 3. Intervals that start after the new one ends: copy them.
  while (i < intervals.length) {
    result.push(intervals[i])
    i++
  }
  return result
}
