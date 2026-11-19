function carFleet(target: number, position: number[], speed: number[]): number {
  const n = position.length
  // Car indices ordered from closest to the target to farthest.
  const order: number[] = []
  for (let i = 0; i < n; i++) {
    order.push(i)
  }
  order.sort((a, b) => position[b] - position[a])

  let fleets = 0
  let slowestAhead = 0 // arrival time of the fleet directly in front
  for (let k = 0; k < n; k++) {
    const car = order[k]
    const time = (target - position[car]) / speed[car] // arrival time if driving alone
    if (time > slowestAhead) {
      // It can't catch the fleet ahead before the target, so it leads a new fleet.
      fleets++
      slowestAhead = time
    }
    // Otherwise it catches up and joins that fleet, arriving at slowestAhead.
  }
  return fleets
}
