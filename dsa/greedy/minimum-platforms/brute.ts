function findPlatform(arrival: number[], departure: number[]): number {
  // The peak always happens at some arrival time.
  let best = 0
  for (const t of arrival) {
    let present = 0
    for (let i = 0; i < arrival.length; i++) if (arrival[i] <= t && t <= departure[i]) present++
    best = Math.max(best, present)
  }
  return best
}
