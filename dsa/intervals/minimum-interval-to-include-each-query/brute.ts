function minInterval(intervals: number[][], queries: number[]): number[] {
  return queries.map((q) => {
    let best = -1
    for (const [l, r] of intervals) {
      if (l <= q && q <= r && (best === -1 || r - l + 1 < best)) best = r - l + 1
    }
    return best
  })
}
