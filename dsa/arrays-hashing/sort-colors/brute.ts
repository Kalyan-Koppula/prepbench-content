function sortColors(nums: number[]): void {
  // Counting sort: one pass to count each color, one pass to rewrite the array.
  const count = new Array(3).fill(0)
  for (let i = 0; i < nums.length; i++) {
    count[nums[i]]++
  }

  let index = 0
  for (let color = 0; color < 3; color++) {
    for (let c = 0; c < count[color]; c++) {
      nums[index] = color
      index++
    }
  }
}
