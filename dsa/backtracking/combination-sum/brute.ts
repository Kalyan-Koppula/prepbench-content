function combinationSum(candidates: number[], target: number): number[][] {
  // Decide how many copies of each candidate to take, one candidate at a time.
  const result: number[][] = []
  const path: number[] = []

  function explore(i: number, sum: number): void {
    if (i === candidates.length) {
      if (sum === target) {
        result.push(path.slice())
      }
      return
    }
    let copies = 0
    while (sum + copies * candidates[i] <= target) {
      explore(i + 1, sum + copies * candidates[i])
      path.push(candidates[i]) // take one more copy for the next round
      copies++
    }
    for (let k = 0; k < copies; k++) {
      path.pop()
    }
  }

  explore(0, 0)
  return result
}
