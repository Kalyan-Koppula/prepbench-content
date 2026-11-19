function fourSum(nums: number[], target: number): number[][] {
  const sorted = nums.slice()
  sorted.sort((a, b) => a - b)
  const n = sorted.length
  const result: number[][] = []

  for (let i = 0; i < n - 3; i++) {
    if (i > 0 && sorted[i] === sorted[i - 1]) {
      continue // same first value as the previous round
    }
    for (let j = i + 1; j < n - 2; j++) {
      if (j > i + 1 && sorted[j] === sorted[j - 1]) {
        continue // same second value for this first value
      }
      // Sums reach about 4 * 10^9. JavaScript numbers hold that exactly;
      // in Java or C++ this sum needs a 64-bit type.
      const remaining = target - sorted[i] - sorted[j]
      let left = j + 1
      let right = n - 1
      while (left < right) {
        const pairSum = sorted[left] + sorted[right]
        if (pairSum < remaining) {
          left++
        } else if (pairSum > remaining) {
          right--
        } else {
          result.push([sorted[i], sorted[j], sorted[left], sorted[right]])
          left++
          right--
          while (left < right && sorted[left] === sorted[left - 1]) {
            left++
          }
          while (left < right && sorted[right] === sorted[right + 1]) {
            right--
          }
        }
      }
    }
  }
  return result
}
