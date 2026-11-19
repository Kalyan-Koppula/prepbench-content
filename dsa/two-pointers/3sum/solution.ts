function threeSum(nums: number[]): number[][] {
  const sorted = nums.slice()
  sorted.sort((a, b) => a - b)
  const n = sorted.length
  const result: number[][] = []

  for (let i = 0; i < n - 2; i++) {
    if (sorted[i] > 0) {
      break // the two values to its right are at least as large, so the sum is positive
    }
    if (i > 0 && sorted[i] === sorted[i - 1]) {
      continue // this first value was already tried
    }
    let left = i + 1
    let right = n - 1
    while (left < right) {
      const sum = sorted[i] + sorted[left] + sorted[right]
      if (sum < 0) {
        left++
      } else if (sum > 0) {
        right--
      } else {
        result.push([sorted[i], sorted[left], sorted[right]])
        left++
        right--
        // Step past equal values so the same triplet is not produced twice.
        while (left < right && sorted[left] === sorted[left - 1]) {
          left++
        }
        while (left < right && sorted[right] === sorted[right + 1]) {
          right--
        }
      }
    }
  }
  return result
}
