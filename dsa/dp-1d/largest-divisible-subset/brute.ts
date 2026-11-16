// Depth-first search over every divisibility chain in sorted order.
function largestDivisibleSubset(nums: number[]): number[] {
  const a = [...nums].sort((x, y) => x - y)
  let best: number[] = []
  const chain: number[] = []
  const dfs = (from: number) => {
    if (chain.length > best.length) best = [...chain]
    for (let i = from; i < a.length; i++) {
      if (chain.length === 0 || a[i] % chain[chain.length - 1] === 0) {
        chain.push(a[i])
        dfs(i + 1)
        chain.pop()
      }
    }
  }
  dfs(0)
  return best
}
