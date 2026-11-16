function combinationSum2(candidates: number[], target: number): number[][] {
  // Group equal values, then choose how many copies (0..available) of each value to take.
  const counts = new Map<number, number>()
  for (const c of candidates) counts.set(c, (counts.get(c) ?? 0) + 1)
  const values = [...counts.keys()]
  const result: number[][] = []
  const go = (i: number, sum: number, picked: number[]) => {
    if (sum > target) return
    if (i === values.length) {
      if (sum === target) result.push(picked)
      return
    }
    for (let k = 0; k <= counts.get(values[i])!; k++) {
      go(i + 1, sum + k * values[i], [...picked, ...Array(k).fill(values[i])])
    }
  }
  go(0, 0, [])
  return result
}
