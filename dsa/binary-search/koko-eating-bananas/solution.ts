function minEatingSpeed(piles: number[], h: number): number {
  const hoursAt = (speed: number) => {
    let hours = 0
    for (const pile of piles) hours += Math.ceil(pile / speed)
    return hours
  }
  let lo = 1
  let hi = Math.max(...piles)
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2)
    if (hoursAt(mid) <= h) hi = mid
    else lo = mid + 1
  }
  return lo
}
