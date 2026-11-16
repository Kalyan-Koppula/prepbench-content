function insert(intervals: number[][], newInterval: number[]): number[][] {
  // Paint all ranges on a doubled axis and read back the runs.
  const all = [...intervals, newInterval]
  let max = 0
  for (const [, e] of all) max = Math.max(max, e)
  const covered = new Array(2 * max + 2).fill(false)
  for (const [s, e] of all) for (let x = 2 * s; x <= 2 * e; x++) covered[x] = true
  const result: number[][] = []
  for (let x = 0; x < covered.length; x++) {
    if (covered[x] && (x === 0 || !covered[x - 1])) result.push([x / 2, x / 2])
    if (covered[x]) result[result.length - 1][1] = x / 2
  }
  return result
}
