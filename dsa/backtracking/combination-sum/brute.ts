function combinationSum(candidates: number[], target: number): number[][] {
  // Decide how many copies of each candidate to take, one candidate at a time.
  const result: number[][] = []
  const go = (i: number, sum: number, picked: number[]) => {
    if (i === candidates.length) {
      if (sum === target) result.push(picked)
      return
    }
    for (let copies = 0; sum + copies * candidates[i] <= target; copies++) {
      go(i + 1, sum + copies * candidates[i], [...picked, ...Array(copies).fill(candidates[i])])
    }
  }
  go(0, 0, [])
  return result
}
