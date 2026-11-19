function majorityElement(nums: number[]): number[] {
  // Extended Boyer-Moore: at most two values can occur more than n/3 times.
  let candidate1 = 0
  let count1 = 0
  let candidate2 = 1 // starts different from candidate1
  let count2 = 0
  for (let i = 0; i < nums.length; i++) {
    const x = nums[i]
    if (x === candidate1) {
      count1++
    } else if (x === candidate2) {
      count2++
    } else if (count1 === 0) {
      candidate1 = x
      count1 = 1
    } else if (count2 === 0) {
      candidate2 = x
      count2 = 1
    } else {
      // x cancels one copy of each candidate: three different values removed.
      count1--
      count2--
    }
  }

  // The vote only finds possibilities; confirm them with real counts.
  let total1 = 0
  let total2 = 0
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] === candidate1) {
      total1++
    } else if (nums[i] === candidate2) {
      total2++
    }
  }
  const threshold = Math.floor(nums.length / 3)
  const result: number[] = []
  if (total1 > threshold) {
    result.push(candidate1)
  }
  if (total2 > threshold) {
    result.push(candidate2)
  }
  return result
}
