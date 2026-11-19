function minEatingSpeed(piles: number[], h: number): number {
  // Any speed below ceil(total / h) can't finish, so scan upward from there.
  let total = 0
  for (let i = 0; i < piles.length; i++) {
    total += piles[i]
  }
  let speed = Math.ceil(total / h)
  if (speed < 1) {
    speed = 1
  }
  while (true) {
    let hours = 0
    for (let i = 0; i < piles.length; i++) {
      hours += Math.ceil(piles[i] / speed)
    }
    if (hours <= h) {
      return speed
    }
    speed++
  }
}
