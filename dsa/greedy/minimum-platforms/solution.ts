function findPlatform(arrival: number[], departure: number[]): number {
  const arr = [...arrival].sort((a, b) => a - b)
  const dep = [...departure].sort((a, b) => a - b)
  let inStation = 0
  let best = 0
  let j = 0
  for (const time of arr) {
    // Free platforms whose train left strictly before this arrival.
    while (dep[j] < time) {
      inStation--
      j++
    }
    inStation++
    best = Math.max(best, inStation)
  }
  return best
}
