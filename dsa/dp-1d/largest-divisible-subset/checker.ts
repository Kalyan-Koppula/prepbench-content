function check(args: any[], output: any, expected: any): boolean | string {
  const nums: number[] = args[0]
  if (!Array.isArray(output)) return 'expected an array'
  const pool = new Set(nums)
  const used = new Set<number>()
  for (const x of output) {
    if (!pool.has(x)) return `${JSON.stringify(x)} is not in nums`
    if (used.has(x)) return `${x} is used more than once`
    used.add(x)
  }
  if (output.length === 0) return 'the subset must not be empty'
  // In sorted order, consecutive divisibility implies every pair divides.
  const sorted = [...output].sort((x, y) => x - y)
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] % sorted[i - 1] !== 0) return `${sorted[i - 1]} and ${sorted[i]} don't divide each other`
  }
  if (Array.isArray(expected) && output.length !== expected.length)
    return `subset has ${output.length} elements, but a valid one with ${expected.length} exists`
  return true
}
