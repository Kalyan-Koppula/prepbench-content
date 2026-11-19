function sumSubarrayMins(arr: number[]): number {
  const MOD = 1000000007
  const n = arr.length
  // left[i]: how many starts give subarrays where arr[i] is the minimum
  //          (distance to the previous strictly smaller element).
  // right[i]: how many ends (distance to the next smaller-or-equal element).
  // Strict on one side, non-strict on the other, so ties are counted once.
  const left = new Array(n).fill(0)
  const right = new Array(n).fill(0)

  let stack: number[] = []
  for (let i = 0; i < n; i++) {
    while (stack.length > 0 && arr[stack[stack.length - 1]] >= arr[i]) {
      stack.pop()
    }
    left[i] = stack.length === 0 ? i + 1 : i - stack[stack.length - 1]
    stack.push(i)
  }

  stack = []
  for (let i = n - 1; i >= 0; i--) {
    while (stack.length > 0 && arr[stack[stack.length - 1]] > arr[i]) {
      stack.pop()
    }
    right[i] = stack.length === 0 ? n - i : stack[stack.length - 1] - i
    stack.push(i)
  }

  let total = 0
  for (let i = 0; i < n; i++) {
    // At most 3e4 * 3e4 * 3e4 < 2^53, exact in a double. Use a 64-bit integer in Java/C++.
    total = (total + arr[i] * left[i] * right[i]) % MOD
  }
  return total
}
