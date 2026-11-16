// Dual formulation: lightest[v] = least weight that achieves total value exactly v.
function knapsack(weights: number[], values: number[], capacity: number): number {
  const maxValue = values.reduce((a, b) => a + b, 0)
  const lightest = new Array(maxValue + 1).fill(Infinity)
  lightest[0] = 0
  for (let i = 0; i < weights.length; i++)
    for (let v = maxValue; v >= values[i]; v--)
      lightest[v] = Math.min(lightest[v], lightest[v - values[i]] + weights[i])
  for (let v = maxValue; v >= 0; v--) if (lightest[v] <= capacity) return v
  return 0
}
