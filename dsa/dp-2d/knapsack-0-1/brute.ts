// Top-down: bestFrom(i, room) = most value from items i.. with `room` weight left.
function knapsack(weights: number[], values: number[], capacity: number): number {
  const memo: number[][] = []
  for (let i = 0; i < weights.length; i++) {
    memo.push(new Array(capacity + 1).fill(-1))
  }
  return bestFrom(weights, values, 0, capacity, memo)
}

function bestFrom(weights: number[], values: number[], i: number, room: number, memo: number[][]): number {
  if (i === weights.length) {
    return 0
  }
  if (memo[i][room] !== -1) {
    return memo[i][room]
  }
  let result = bestFrom(weights, values, i + 1, room, memo) // skip item i
  if (weights[i] <= room) {
    const taken = values[i] + bestFrom(weights, values, i + 1, room - weights[i], memo)
    if (taken > result) {
      result = taken
    }
  }
  memo[i][room] = result
  return result
}
