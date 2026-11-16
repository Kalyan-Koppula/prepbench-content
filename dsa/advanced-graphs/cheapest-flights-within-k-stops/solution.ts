function findCheapestPrice(n: number, flights: number[][], src: number, dst: number, k: number): number {
  let price = new Array(n).fill(Infinity)
  price[src] = 0
  // Round i finds the cheapest routes using at most i flights.
  for (let round = 0; round <= k; round++) {
    const next = price.slice()
    for (const [from, to, cost] of flights) {
      if (price[from] + cost < next[to]) next[to] = price[from] + cost
    }
    price = next
  }
  return price[dst] === Infinity ? -1 : price[dst]
}
