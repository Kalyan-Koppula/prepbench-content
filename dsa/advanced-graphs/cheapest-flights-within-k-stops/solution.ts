function findCheapestPrice(n: number, flights: number[][], src: number, dst: number, k: number): number {
  // Bellman-Ford limited to k + 1 rounds: after round i, price[v] is the
  // cheapest way to reach v using at most i + 1 flights.
  let price = new Array(n).fill(Infinity)
  price[src] = 0
  for (let round = 0; round <= k; round++) {
    // Relax from the previous round's prices only, so each round adds at most one flight.
    const next = price.slice()
    for (let i = 0; i < flights.length; i++) {
      const from = flights[i][0]
      const to = flights[i][1]
      const cost = flights[i][2]
      if (price[from] + cost < next[to]) {
        next[to] = price[from] + cost
      }
    }
    price = next
  }
  return price[dst] === Infinity ? -1 : price[dst]
}
