function topKFrequent(nums: number[], k: number): number[] {
  const freq = new Map<number, number>()
  for (let i = 0; i < nums.length; i++) {
    const seen = freq.get(nums[i])
    if (seen === undefined) {
      freq.set(nums[i], 1)
    } else {
      freq.set(nums[i], seen + 1)
    }
  }

  // buckets[f] holds the values that occur exactly f times.
  // No value can occur more than nums.length times.
  const buckets: number[][] = []
  for (let f = 0; f <= nums.length; f++) {
    buckets.push([])
  }
  for (const entry of freq.entries()) {
    const value = entry[0]
    const count = entry[1]
    buckets[count].push(value)
  }

  // Walk from the highest frequency down until k values are collected.
  const result: number[] = []
  for (let f = nums.length; f > 0 && result.length < k; f--) {
    const bucket = buckets[f]
    for (let i = 0; i < bucket.length && result.length < k; i++) {
      result.push(bucket[i])
    }
  }
  return result
}
