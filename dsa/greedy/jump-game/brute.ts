function canJump(nums: number[]): boolean {
  const n = nums.length
  const ok: boolean[] = new Array(n).fill(false)
  ok[n - 1] = true
  for (let i = n - 2; i >= 0; i--) {
    for (let step = 1; step <= nums[i] && i + step < n; step++) {
      if (ok[i + step]) {
        ok[i] = true
        break
      }
    }
  }
  return ok[0]
}
