function networkDelayTime(times: number[][], n: number, k: number): number {
  // Bellman-Ford: relax every link n - 1 times. O(n * E).
  const dist = new Array(n + 1).fill(Infinity)
  dist[k] = 0
  for (let round = 1; round < n; round++) {
    let changed = false
    for (let i = 0; i < times.length; i++) {
      const u = times[i][0]
      const v = times[i][1]
      const w = times[i][2]
      if (dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w
        changed = true
      }
    }
    if (!changed) {
      break
    }
  }
  let latest = 0
  for (let v = 1; v <= n; v++) {
    if (dist[v] > latest) {
      latest = dist[v]
    }
  }
  return latest === Infinity ? -1 : latest
}
