function findPlatform(arrival: number[], departure: number[]): number {
  const n = arrival.length
  const arr: number[] = []
  const dep: number[] = []
  for (let i = 0; i < n; i++) {
    arr.push(arrival[i])
    dep.push(departure[i])
  }
  arr.sort((a, b) => a - b)
  dep.sort((a, b) => a - b)

  let inStation = 0
  let best = 0
  let j = 0 // next departure to process
  for (let i = 0; i < n; i++) {
    // Trains that left strictly before this arrival free their platforms.
    while (dep[j] < arr[i]) {
      inStation--
      j++
    }
    inStation++
    if (inStation > best) {
      best = inStation
    }
  }
  return best
}
