// Mark which values 0..n are present, then find the unmarked one.
function missingNumber(nums: number[]): number {
  const n = nums.length
  const present = new Array(n + 1).fill(false)
  for (let i = 0; i < n; i++) {
    present[nums[i]] = true
  }
  for (let v = 0; v <= n; v++) {
    if (!present[v]) {
      return v
    }
  }
  return -1
}
