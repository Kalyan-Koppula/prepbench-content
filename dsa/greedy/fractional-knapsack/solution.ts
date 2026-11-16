function fractionalKnapsack(values: number[], weights: number[], capacity: number): number {
  const order = [...values.keys()]
  // Sort by value density, descending; cross-multiply to stay in exact integers.
  order.sort((a, b) => values[b] * weights[a] - values[a] * weights[b])

  let room = capacity
  let total = 0
  for (const i of order) {
    if (room === 0) break
    const take = Math.min(weights[i], room)
    total += (values[i] * take) / weights[i]
    room -= take
  }
  return total
}
