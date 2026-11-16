function jump(nums: number[]): number {
  let jumps = 0
  let windowEnd = 0 // last index reachable with `jumps` jumps
  let farthest = 0 // last index reachable with `jumps + 1` jumps
  for (let i = 0; i < nums.length - 1; i++) {
    farthest = Math.max(farthest, i + nums[i])
    if (i === windowEnd) {
      jumps++
      windowEnd = farthest
    }
  }
  return jumps
}
