function canCompleteCircuit(gas: number[], cost: number[]): number {
  const n = gas.length
  for (let s = 0; s < n; s++) {
    let tank = 0
    let ok = true
    for (let k = 0; k < n; k++) {
      const i = (s + k) % n
      tank += gas[i] - cost[i]
      if (tank < 0) {
        ok = false
        break
      }
    }
    if (ok) return s
  }
  return -1
}
