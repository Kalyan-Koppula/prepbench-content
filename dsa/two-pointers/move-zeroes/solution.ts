function moveZeroes(nums: number[]): void {
  let write = 0
  for (let read = 0; read < nums.length; read++) {
    if (nums[read] !== 0) {
      if (read !== write) [nums[read], nums[write]] = [nums[write], nums[read]]
      write++
    }
  }
}
