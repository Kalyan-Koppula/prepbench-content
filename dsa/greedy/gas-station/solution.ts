function canCompleteCircuit(gas: number[], cost: number[]): number {
  let total = 0
  let tank = 0
  let start = 0
  for (let i = 0; i < gas.length; i++) {
    const diff = gas[i] - cost[i]
    total += diff
    tank += diff
    if (tank < 0) {
      // Nothing in [start, i] can be the start; try the next station.
      start = i + 1
      tank = 0
    }
  }
  return total >= 0 ? start : -1
}
