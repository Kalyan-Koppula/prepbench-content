function moveZeroes(nums: number[]): void {
  // Copy the non-zeros aside in order, then write them back and pad with zeros.
  // Simple and linear, but it uses a second array.
  const nonZero: number[] = []
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] !== 0) {
      nonZero.push(nums[i])
    }
  }
  for (let i = 0; i < nums.length; i++) {
    if (i < nonZero.length) {
      nums[i] = nonZero[i]
    } else {
      nums[i] = 0
    }
  }
}
