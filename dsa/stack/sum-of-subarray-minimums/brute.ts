function sumSubarrayMins(arr: number[]): number {
  const MOD = 1000000007
  let total = 0
  for (let start = 0; start < arr.length; start++) {
    let min = arr[start]
    for (let end = start; end < arr.length; end++) {
      if (arr[end] < min) {
        min = arr[end]
      }
      total = (total + min) % MOD
    }
  }
  return total
}
