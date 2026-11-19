function jobSequencing(deadline: number[], profit: number[]): number[] {
  const n = deadline.length
  // Job indices, most profitable first.
  const order: number[] = []
  for (let i = 0; i < n; i++) {
    order.push(i)
  }
  order.sort((a, b) => profit[b] - profit[a])

  // taken[t] = true if time slot t (1..n) already has a job.
  const taken = new Array(n + 1).fill(false)
  let jobsDone = 0
  let totalProfit = 0
  for (let k = 0; k < n; k++) {
    const job = order[k]
    // Place it as LATE as possible, leaving earlier slots for tighter deadlines.
    let slot = Math.min(deadline[job], n)
    while (slot >= 1 && taken[slot]) {
      slot--
    }
    if (slot >= 1) {
      taken[slot] = true
      jobsDone++
      totalProfit += profit[job]
    }
  }
  return [jobsDone, totalProfit]
}
