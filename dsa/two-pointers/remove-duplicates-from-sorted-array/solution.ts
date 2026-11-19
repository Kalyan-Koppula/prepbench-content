function removeDuplicates(nums: number[]): number[] {
  // nums[0 .. write - 1] is the deduplicated prefix built so far.
  // The first value is always kept.
  let write = 1
  for (let read = 1; read < nums.length; read++) {
    // Sorted input: a value is new exactly when it differs from the last one kept.
    if (nums[read] !== nums[write - 1]) {
      nums[write] = nums[read]
      write++
    }
  }
  return nums.slice(0, write)
}
