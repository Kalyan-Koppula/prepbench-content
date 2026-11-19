function topKFrequent(nums: number[], k: number): number[] {
  // Count each distinct value, keeping values and counts in parallel arrays.
  const values: number[] = []
  const counts: number[] = []
  for (let i = 0; i < nums.length; i++) {
    let position = -1
    for (let v = 0; v < values.length; v++) {
      if (values[v] === nums[i]) {
        position = v
        break
      }
    }
    if (position === -1) {
      values.push(nums[i])
      counts.push(1)
    } else {
      counts[position]++
    }
  }

  // k rounds: each round takes the most frequent value not taken yet.
  const taken = new Array(values.length).fill(false)
  const result: number[] = []
  for (let round = 0; round < k; round++) {
    let best = -1
    for (let v = 0; v < values.length; v++) {
      if (!taken[v] && (best === -1 || counts[v] > counts[best])) {
        best = v
      }
    }
    taken[best] = true
    result.push(values[best])
  }
  return result
}
