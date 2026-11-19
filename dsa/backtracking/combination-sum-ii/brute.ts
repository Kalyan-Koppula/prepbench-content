function combinationSum2(candidates: number[], target: number): number[][] {
  // Group equal values, then choose how many copies of each distinct value to take.
  const sorted = candidates.slice()
  sorted.sort((a, b) => a - b)
  const values: number[] = []
  const counts: number[] = []
  for (let i = 0; i < sorted.length; i++) {
    if (values.length > 0 && values[values.length - 1] === sorted[i]) {
      counts[counts.length - 1]++
    } else {
      values.push(sorted[i])
      counts.push(1)
    }
  }
  const result: number[][] = []
  const path: number[] = []

  function explore(i: number, sum: number): void {
    if (sum > target) {
      return
    }
    if (i === values.length) {
      if (sum === target) {
        result.push(path.slice())
      }
      return
    }
    for (let k = 0; k <= counts[i]; k++) {
      explore(i + 1, sum + k * values[i])
      path.push(values[i])
    }
    for (let k = 0; k <= counts[i]; k++) {
      path.pop()
    }
  }

  explore(0, 0)
  return result
}
