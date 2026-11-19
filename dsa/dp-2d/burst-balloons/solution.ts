function maxCoins(nums: number[]): number {
  // Add a virtual balloon worth 1 at each end; they are never burst.
  const val: number[] = [1]
  for (let i = 0; i < nums.length; i++) {
    val.push(nums[i])
  }
  val.push(1)
  const size = val.length
  // best[l][r] = most coins from bursting every balloon strictly between l and r.
  const best: number[][] = []
  for (let i = 0; i < size; i++) {
    best.push(new Array(size).fill(0))
  }
  for (let gap = 2; gap < size; gap++) {
    for (let l = 0; l + gap < size; l++) {
      const r = l + gap
      for (let k = l + 1; k < r; k++) {
        // k is the LAST balloon burst between l and r, so its neighbours are then l and r.
        const coins = best[l][k] + val[l] * val[k] * val[r] + best[k][r]
        if (coins > best[l][r]) {
          best[l][r] = coins
        }
      }
    }
  }
  return best[0][size - 1]
}
