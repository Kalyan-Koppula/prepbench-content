function moveZeroes(nums: number[]): void {
  // nums[0 .. write - 1]: the non-zeros seen so far, in their original order.
  // nums[write .. read - 1]: only zeros.
  let write = 0
  for (let read = 0; read < nums.length; read++) {
    if (nums[read] !== 0) {
      // Skip the swap when nothing would move (no zero seen yet).
      if (read !== write) {
        const temp = nums[write]
        nums[write] = nums[read]
        nums[read] = temp
      }
      write++
    }
  }
}
