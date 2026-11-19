function largestDivisibleSubset(nums: number[]): number[] {
  const a: number[] = []
  for (let i = 0; i < nums.length; i++) {
    a.push(nums[i])
  }
  a.sort((x, y) => x - y)
  const n = a.length
  const length = new Array(n).fill(1) // longest chain ending at a[i]
  const previous = new Array(n).fill(-1) // the element before a[i] in that chain
  let bestEnd = 0

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < i; j++) {
      if (a[i] % a[j] === 0 && length[j] + 1 > length[i]) {
        length[i] = length[j] + 1
        previous[i] = j
      }
    }
    if (length[i] > length[bestEnd]) {
      bestEnd = i
    }
  }

  // Walk back along the chain, then reverse into increasing order.
  const backwards: number[] = []
  let i = bestEnd
  while (i !== -1) {
    backwards.push(a[i])
    i = previous[i]
  }
  const result: number[] = []
  for (let k = backwards.length - 1; k >= 0; k--) {
    result.push(backwards[k])
  }
  return result
}
