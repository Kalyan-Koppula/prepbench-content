function nextGreaterElements(nums: number[]): number[] {
  const n = nums.length
  const result = new Array(n).fill(-1)
  const stack: number[] = [] // indices still looking for a greater value
  // Walk the array twice so every element can see the ones before it (the wrap).
  for (let i = 0; i < 2 * n; i++) {
    const value = nums[i % n]
    while (stack.length > 0 && nums[stack[stack.length - 1]] < value) {
      const index = stack.pop() as number
      result[index] = value
    }
    if (i < n) {
      stack.push(i) // the second lap only answers, it never adds
    }
  }
  return result
}
