function networkDelayTime(times: number[][], n: number, k: number): number {
  // adj[u] holds [v, w] pairs for each link u -> v taking w time.
  const adj: number[][][] = []
  for (let i = 0; i <= n; i++) {
    adj.push([])
  }
  for (let i = 0; i < times.length; i++) {
    adj[times[i][0]].push([times[i][1], times[i][2]])
  }
  // Dijkstra from k.
  const dist = new Array(n + 1).fill(Infinity)
  dist[k] = 0
  const heap = new PriorityQueue<number[]>((a, b) => a[0] - b[0]) // [time, node]
  heap.push([0, k])
  while (!heap.isEmpty()) {
    const top = heap.pop() as number[]
    const d = top[0]
    const u = top[1]
    if (d > dist[u]) {
      continue // stale: u was already finalised with a smaller time
    }
    for (let i = 0; i < adj[u].length; i++) {
      const v = adj[u][i][0]
      const w = adj[u][i][1]
      if (d + w < dist[v]) {
        dist[v] = d + w
        heap.push([dist[v], v])
      }
    }
  }
  // The signal has reached everyone when the slowest node receives it.
  let latest = 0
  for (let v = 1; v <= n; v++) {
    if (dist[v] > latest) {
      latest = dist[v]
    }
  }
  return latest === Infinity ? -1 : latest
}
