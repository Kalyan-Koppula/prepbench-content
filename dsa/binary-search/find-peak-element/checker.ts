function check(args: any[], output: any, expected: any): boolean | string {
  const nums: number[] = args[0]
  if (!Number.isInteger(output) || output < 0 || output >= nums.length) return `index ${JSON.stringify(output)} is out of range`
  const left = output === 0 ? -Infinity : nums[output - 1]
  const right = output === nums.length - 1 ? -Infinity : nums[output + 1]
  if (nums[output] > left && nums[output] > right) return true
  return `nums[${output}] = ${nums[output]} is not greater than both neighbours`
}
