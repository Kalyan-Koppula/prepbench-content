function shipWithinDays(weights: number[], days: number): number {
  for (let capacity = Math.max(...weights); ; capacity++) {
    let used = 1
    let load = 0
    for (const w of weights) {
      if (load + w > capacity) {
        used++
        load = 0
      }
      load += w
    }
    if (used <= days) return capacity
  }
}
