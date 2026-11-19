// Paint every covered point on a doubled axis (so [1, 2] and [3, 4] stay apart),
// then read back the painted runs. O(n * range).
function merge(intervals: number[][]): number[][] {
  let max = 0
  for (let i = 0; i < intervals.length; i++) {
    if (intervals[i][1] > max) {
      max = intervals[i][1]
    }
  }
  const covered = new Array(2 * max + 2).fill(false)
  for (let i = 0; i < intervals.length; i++) {
    for (let x = 2 * intervals[i][0]; x <= 2 * intervals[i][1]; x++) {
      covered[x] = true
    }
  }
  const result: number[][] = []
  for (let x = 0; x < covered.length; x++) {
    if (!covered[x]) {
      continue
    }
    if (x === 0 || !covered[x - 1]) {
      result.push([x / 2, x / 2]) // a new run starts
    }
    result[result.length - 1][1] = x / 2 // extend the current run
  }
  return result
}
