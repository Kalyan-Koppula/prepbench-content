// O(n^2): endAt[i] = best total whose last taken house is i.
function rob(nums: number[]): number {
  const endAt: number[] = []
  let best = 0
  for (let i = 0; i < nums.length; i++) {
    let before = 0
    for (let j = 0; j <= i - 2; j++) before = Math.max(before, endAt[j])
    endAt.push(before + nums[i])
    best = Math.max(best, endAt[i])
  }
  return best
}
