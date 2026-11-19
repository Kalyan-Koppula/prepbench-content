function findCheapestPrice(n: number, flights: number[][], src: number, dst: number, k: number): number {
  // DFS over every route with at most k + 1 flights: exponential in the worst case,
  // pruned when the route is already more expensive than the best found.
  const adj: number[][][] = []
  for (let i = 0; i < n; i++) {
    adj.push([])
  }
  for (let i = 0; i < flights.length; i++) {
    adj[flights[i][0]].push([flights[i][1], flights[i][2]])
  }
  const best = [Infinity]
  // cheapestAt[v][f] prunes routes that reach v with f flights no cheaper than before.
  const cheapestAt: number[][] = []
  for (let i = 0; i < n; i++) {
    cheapestAt.push(new Array(k + 2).fill(Infinity))
  }

  function explore(city: number, flightsUsed: number, cost: number): void {
    if (cost >= best[0]) {
      return
    }
    if (city === dst) {
      best[0] = cost
      return
    }
    if (flightsUsed === k + 1) {
      return
    }
    if (cost >= cheapestAt[city][flightsUsed]) {
      return
    }
    cheapestAt[city][flightsUsed] = cost
    for (let i = 0; i < adj[city].length; i++) {
      explore(adj[city][i][0], flightsUsed + 1, cost + adj[city][i][1])
    }
  }

  explore(src, 0, 0)
  return best[0] === Infinity ? -1 : best[0]
}
