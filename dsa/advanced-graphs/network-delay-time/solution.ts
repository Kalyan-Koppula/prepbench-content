function networkDelayTime(times: number[][], n: number, k: number): number {
  const adj: number[][][] = Array.from({ length: n + 1 }, () => [])
  for (const [u, v, w] of times) adj[u].push([v, w])

  const dist = new Array(n + 1).fill(Infinity)
  dist[k] = 0
  const pq = new PriorityQueue<number[]>((a, b) => a[0] - b[0]) // [time, node]
  pq.push([0, k])
  while (!pq.isEmpty()) {
    const [d, u] = pq.pop()!
    if (d > dist[u]) continue // stale entry
    for (const [v, w] of adj[u]) {
      if (d + w < dist[v]) {
        dist[v] = d + w
        pq.push([dist[v], v])
      }
    }
  }

  let latest = 0
  for (let v = 1; v <= n; v++) latest = Math.max(latest, dist[v])
  return latest === Infinity ? -1 : latest
}
