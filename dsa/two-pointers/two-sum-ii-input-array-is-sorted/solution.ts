function twoSum(numbers: number[], target: number): number[] {
  let left = 0
  let right = numbers.length - 1
  while (left < right) {
    const sum = numbers[left] + numbers[right]
    if (sum === target) {
      return [left + 1, right + 1] // the answer is 1-based
    }
    if (sum < target) {
      // numbers[left] is too small even with the largest partner left,
      // so it cannot be in any pair.
      left++
    } else {
      // numbers[right] is too big even with the smallest partner left.
      right--
    }
  }
  return [] // unreachable: the problem guarantees exactly one pair
}
