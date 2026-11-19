function rob(nums: number[]): number {
  // O(n^2): endAt[i] = best total whose last robbed house is i.
  const endAt: number[] = []
  let best = 0
  for (let i = 0; i < nums.length; i++) {
    let before = 0
    for (let j = 0; j <= i - 2; j++) {
      if (endAt[j] > before) {
        before = endAt[j]
      }
    }
    endAt.push(before + nums[i])
    if (endAt[i] > best) {
      best = endAt[i]
    }
  }
  return best
}
