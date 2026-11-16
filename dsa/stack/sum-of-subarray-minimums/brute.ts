function sumSubarrayMins(arr: number[]): number {
  let total = 0
  for (let i = 0; i < arr.length; i++) {
    let min = Infinity
    for (let j = i; j < arr.length; j++) {
      min = Math.min(min, arr[j])
      total = (total + min) % 1_000_000_007
    }
  }
  return total
}
