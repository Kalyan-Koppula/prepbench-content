function sumSubarrayMins(arr: number[]): number {
  const MOD = 1_000_000_007
  const n = arr.length
  const left = new Array(n) // choices of start: distance to previous smaller (strict)
  const right = new Array(n) // choices of end: distance to next smaller-or-equal
  const stack: number[] = []

  for (let i = 0; i < n; i++) {
    while (stack.length && arr[stack[stack.length - 1]] >= arr[i]) stack.pop()
    left[i] = stack.length ? i - stack[stack.length - 1] : i + 1
    stack.push(i)
  }
  stack.length = 0
  for (let i = n - 1; i >= 0; i--) {
    while (stack.length && arr[stack[stack.length - 1]] > arr[i]) stack.pop()
    right[i] = stack.length ? stack[stack.length - 1] - i : n - i
    stack.push(i)
  }

  let total = 0
  for (let i = 0; i < n; i++) {
    total = (total + arr[i] * left[i] * right[i]) % MOD
  }
  return total
}
