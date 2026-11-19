// Hours needed to finish every pile at the given speed.
function hoursAt(piles: number[], speed: number): number {
  let hours = 0
  for (let i = 0; i < piles.length; i++) {
    hours += Math.ceil(piles[i] / speed)
  }
  return hours
}

function minEatingSpeed(piles: number[], h: number): number {
  let biggest = 0
  for (let i = 0; i < piles.length; i++) {
    if (piles[i] > biggest) {
      biggest = piles[i]
    }
  }
  // The answer is in [1, biggest]: eating faster than the biggest pile never helps.
  let lo = 1
  let hi = biggest
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2)
    if (hoursAt(piles, mid) <= h) {
      hi = mid // mid works; maybe something slower works too
    } else {
      lo = mid + 1 // mid is too slow
    }
  }
  return lo
}
