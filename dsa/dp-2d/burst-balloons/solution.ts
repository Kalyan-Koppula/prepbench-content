function maxCoins(nums: number[]): number {
  const val = [1, ...nums, 1] // virtual walls worth 1
  const size = val.length
  // best[l][r] = most coins from bursting every balloon strictly between walls l and r.
  const best: number[][] = Array.from({ length: size }, () => new Array(size).fill(0))

  for (let gap = 2; gap < size; gap++) {
    for (let l = 0; l + gap < size; l++) {
      const r = l + gap
      for (let k = l + 1; k < r; k++) {
        // k is the last balloon burst in (l, r): its neighbours are then the walls.
        const coins = best[l][k] + val[l] * val[k] * val[r] + best[k][r]
        if (coins > best[l][r]) best[l][r] = coins
      }
    }
  }
  return best[0][size - 1]
}
