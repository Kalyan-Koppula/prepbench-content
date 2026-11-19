// The busiest moment is always an arrival. For each arrival time, count the
// trains in the station at that moment. O(n^2).
function findPlatform(arrival: number[], departure: number[]): number {
  let best = 0
  for (let k = 0; k < arrival.length; k++) {
    const t = arrival[k]
    let present = 0
    for (let i = 0; i < arrival.length; i++) {
      if (arrival[i] <= t && t <= departure[i]) {
        present++
      }
    }
    if (present > best) {
      best = present
    }
  }
  return best
}
