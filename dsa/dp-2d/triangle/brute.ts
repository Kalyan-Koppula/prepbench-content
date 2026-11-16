// Bellman-Ford style relaxation from the apex until nothing changes (handles negatives).
function minimumTotal(triangle: number[][]): number {
  const dist = triangle.map((row) => row.map(() => Infinity))
  dist[0][0] = triangle[0][0]
  let changed = true
  while (changed) {
    changed = false
    for (let i = 0; i + 1 < triangle.length; i++)
      for (let j = 0; j <= i; j++)
        for (const k of [j, j + 1]) {
          const cand = dist[i][j] + triangle[i + 1][k]
          if (cand < dist[i + 1][k]) {
            dist[i + 1][k] = cand
            changed = true
          }
        }
  }
  return Math.min(...dist[triangle.length - 1])
}
