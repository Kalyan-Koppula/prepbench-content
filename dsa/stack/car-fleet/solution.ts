function carFleet(target: number, position: number[], speed: number[]): number {
  const cars = position.map((p, i) => [p, (target - p) / speed[i]])
  cars.sort((a, b) => b[0] - a[0]) // closest to target first
  let fleets = 0
  let slowestAhead = 0 // arrival time of the fleet directly in front
  for (const [, time] of cars) {
    if (time > slowestAhead) {
      // Can't catch the fleet ahead before the target: new fleet.
      fleets++
      slowestAhead = time
    }
  }
  return fleets
}
