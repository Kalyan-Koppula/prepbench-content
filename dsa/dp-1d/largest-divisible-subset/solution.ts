function largestDivisibleSubset(nums: number[]): number[] {
  const a = [...nums].sort((x, y) => x - y)
  const n = a.length
  const len = new Array(n).fill(1) // longest chain ending at a[i]
  const parent = new Array(n).fill(-1) // previous element in that chain
  let bestEnd = 0

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < i; j++) {
      if (a[i] % a[j] === 0 && len[j] + 1 > len[i]) {
        len[i] = len[j] + 1
        parent[i] = j
      }
    }
    if (len[i] > len[bestEnd]) bestEnd = i
  }

  const chain: number[] = []
  for (let i = bestEnd; i !== -1; i = parent[i]) chain.push(a[i])
  return chain.reverse()
}
