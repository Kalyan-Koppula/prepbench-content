function kClosest(points: number[][], k: number): number[][] {
  // Sort every point by distance and take the first k: O(n log n).
  const sorted = points.slice()
  sorted.sort((a, b) => a[0] * a[0] + a[1] * a[1] - (b[0] * b[0] + b[1] * b[1]))
  const result: number[][] = []
  for (let i = 0; i < k; i++) {
    result.push(sorted[i])
  }
  return result
}
