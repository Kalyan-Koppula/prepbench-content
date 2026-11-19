// Days needed if the ship can carry `capacity` per day, loading greedily in order.
function daysNeeded(weights: number[], capacity: number): number {
  let days = 1
  let load = 0
  for (let i = 0; i < weights.length; i++) {
    if (load + weights[i] > capacity) {
      days++ // this package starts a new day
      load = 0
    }
    load += weights[i]
  }
  return days
}

function shipWithinDays(weights: number[], days: number): number {
  // The capacity must fit the heaviest package, and the total always works in one day.
  let lo = 0
  let hi = 0
  for (let i = 0; i < weights.length; i++) {
    if (weights[i] > lo) {
      lo = weights[i]
    }
    hi += weights[i]
  }
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2)
    if (daysNeeded(weights, mid) <= days) {
      hi = mid // mid works; try smaller
    } else {
      lo = mid + 1 // too small
    }
  }
  return lo
}
