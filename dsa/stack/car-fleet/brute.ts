function carFleet(target: number, position: number[], speed: number[]): number {
  // A car can't arrive before any car ahead of it, so its real arrival time is
  // the largest solo time among itself and every car ahead. Cars in the same
  // fleet share an arrival time; different fleets arrive at different times.
  const n = position.length
  const arrivals = new Set<number>()
  for (let i = 0; i < n; i++) {
    let arrive = (target - position[i]) / speed[i]
    for (let j = 0; j < n; j++) {
      if (position[j] > position[i]) {
        const ahead = (target - position[j]) / speed[j]
        if (ahead > arrive) {
          arrive = ahead
        }
      }
    }
    arrivals.add(arrive)
  }
  return arrivals.size
}
