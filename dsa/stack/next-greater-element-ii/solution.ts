function nextGreaterElements(nums: number[]): number[] {
  const n = nums.length
  const result = new Array(n).fill(-1)
  const stack: number[] = [] // indices still looking for a greater value
  for (let i = 0; i < 2 * n; i++) {
    const value = nums[i % n]
    while (stack.length && nums[stack[stack.length - 1]] < value) {
      result[stack.pop()!] = value
    }
    if (i < n) stack.push(i) // second lap only resolves, never adds
  }
  return result
}
