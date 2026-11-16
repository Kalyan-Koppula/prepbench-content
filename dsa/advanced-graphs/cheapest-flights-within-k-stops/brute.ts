function findCheapestPrice(n: number, flights: number[][], src: number, dst: number, k: number): number {
  // exact[e][v] = cheapest way to reach v using exactly e flights.
  const exact: number[][] = [new Array(n).fill(Infinity)]
  exact[0][src] = 0
  for (let e = 1; e <= k + 1; e++) {
    const row = new Array(n).fill(Infinity)
    for (const [from, to, cost] of flights) row[to] = Math.min(row[to], exact[e - 1][from] + cost)
    exact.push(row)
  }
  const best = Math.min(...exact.map((row) => row[dst]))
  return best === Infinity ? -1 : best
}
