function shipWithinDays(weights: number[], days: number): number {
  let heaviest = 0
  for (let i = 0; i < weights.length; i++) {
    if (weights[i] > heaviest) {
      heaviest = weights[i]
    }
  }
  // Try every capacity from the heaviest package upward.
  let capacity = heaviest
  while (true) {
    let used = 1
    let load = 0
    for (let i = 0; i < weights.length; i++) {
      if (load + weights[i] > capacity) {
        used++
        load = 0
      }
      load += weights[i]
    }
    if (used <= days) {
      return capacity
    }
    capacity++
  }
}
