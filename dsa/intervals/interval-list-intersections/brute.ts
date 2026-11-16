function intervalIntersection(firstList: number[][], secondList: number[][]): number[][] {
  const result: number[][] = []
  for (const [a, b] of firstList)
    for (const [c, d] of secondList) {
      const lo = Math.max(a, c)
      const hi = Math.min(b, d)
      if (lo <= hi) result.push([lo, hi])
    }
  return result.sort((x, y) => x[0] - y[0])
}
