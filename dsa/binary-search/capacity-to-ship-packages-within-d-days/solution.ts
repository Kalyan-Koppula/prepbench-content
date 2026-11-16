function shipWithinDays(weights: number[], days: number): number {
  const daysNeeded = (capacity: number) => {
    let used = 1
    let load = 0
    for (const w of weights) {
      if (load + w > capacity) {
        used++
        load = 0
      }
      load += w
    }
    return used
  }
  let lo = Math.max(...weights)
  let hi = weights.reduce((a, b) => a + b, 0)
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2)
    if (daysNeeded(mid) <= days) hi = mid
    else lo = mid + 1
  }
  return lo
}
