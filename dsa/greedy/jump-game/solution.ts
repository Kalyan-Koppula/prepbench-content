function canJump(nums: number[]): boolean {
  let reach = 0 // the farthest index reachable so far
  for (let i = 0; i < nums.length; i++) {
    if (i > reach) {
      return false // index i can't be reached, so nothing after it can either
    }
    if (i + nums[i] > reach) {
      reach = i + nums[i]
    }
    if (reach >= nums.length - 1) {
      return true
    }
  }
  return true
}
