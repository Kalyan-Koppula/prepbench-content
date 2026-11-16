function carFleet(target: number, position: number[], speed: number[]): number {
  // A car can never arrive before any car ahead of it, so its actual arrival
  // time is the max solo time over itself and every car ahead. Each fleet
  // arrives at a distinct time.
  const n = position.length
  const arrivals = new Set<number>()
  for (let i = 0; i < n; i++) {
    let arrive = (target - position[i]) / speed[i]
    for (let j = 0; j < n; j++) {
      if (position[j] > position[i]) arrive = Math.max(arrive, (target - position[j]) / speed[j])
    }
    arrivals.add(arrive)
  }
  return arrivals.size
}
