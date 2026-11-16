function merge(intervals: number[][]): number[][] {
  // Paint covered points on a doubled axis (so [1,2] and [3,4] stay separate),
  // then read back the painted runs.
  let max = 0
  for (const [, e] of intervals) max = Math.max(max, e)
  const covered = new Array(2 * max + 2).fill(false)
  for (const [s, e] of intervals) for (let x = 2 * s; x <= 2 * e; x++) covered[x] = true
  const result: number[][] = []
  for (let x = 0; x < covered.length; x++) {
    if (covered[x] && (x === 0 || !covered[x - 1])) result.push([x / 2, x / 2])
    if (covered[x]) result[result.length - 1][1] = x / 2
  }
  return result
}
