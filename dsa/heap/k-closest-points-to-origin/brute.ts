function kClosest(points: number[][], k: number): number[][] {
  const dist = (p: number[]) => p[0] * p[0] + p[1] * p[1]
  return [...points].sort((a, b) => dist(a) - dist(b)).slice(0, k)
}
