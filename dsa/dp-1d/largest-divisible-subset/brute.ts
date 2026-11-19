// The same DP in the other direction: the longest chain STARTING at a[i],
// computed from the right, so the chain is read forwards with `next` pointers.
function largestDivisibleSubset(nums: number[]): number[] {
  const a: number[] = []
  for (let i = 0; i < nums.length; i++) {
    a.push(nums[i])
  }
  a.sort((x, y) => x - y)
  const n = a.length
  const length = new Array(n).fill(1)
  const next = new Array(n).fill(-1)
  let bestStart = n - 1
  for (let i = n - 1; i >= 0; i--) {
    for (let j = i + 1; j < n; j++) {
      if (a[j] % a[i] === 0 && length[j] + 1 > length[i]) {
        length[i] = length[j] + 1
        next[i] = j
      }
    }
    if (length[i] >= length[bestStart]) {
      bestStart = i
    }
  }
  const result: number[] = []
  let i = bestStart
  while (i !== -1) {
    result.push(a[i])
    i = next[i]
  }
  return result
}
