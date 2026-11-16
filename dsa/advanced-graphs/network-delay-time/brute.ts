function networkDelayTime(times: number[][], n: number, k: number): number {
  // Bellman-Ford: n - 1 rounds of relaxing every edge.
  const dist = new Array(n + 1).fill(Infinity)
  dist[k] = 0
  for (let round = 1; round < n; round++)
    for (const [u, v, w] of times) if (dist[u] + w < dist[v]) dist[v] = dist[u] + w
  const latest = Math.max(...dist.slice(1))
  return latest === Infinity ? -1 : latest
}
