function fractionalKnapsack(values: number[], weights: number[], capacity: number): number {
  const n = values.length
  const order: number[] = []
  for (let i = 0; i < n; i++) {
    order.push(i)
  }
  // Highest value per unit of weight first. Compare a/b against c/d as a*d against c*b
  // to avoid division.
  order.sort((a, b) => values[b] * weights[a] - values[a] * weights[b])

  let room = capacity
  let total = 0
  for (let k = 0; k < n && room > 0; k++) {
    const i = order[k]
    if (weights[i] <= room) {
      total += values[i] // the whole item fits
      room -= weights[i]
    } else {
      total += (values[i] * room) / weights[i] // take the fraction that fits
      room = 0
    }
  }
  return total
}
