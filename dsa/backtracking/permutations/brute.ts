function permute(nums: number[]): number[][] {
  // Swap-based: fix position k by swapping each later element into it.
  const arr = nums.slice()
  const result: number[][] = []

  function explore(k: number): void {
    if (k === arr.length) {
      result.push(arr.slice())
      return
    }
    for (let i = k; i < arr.length; i++) {
      let temp = arr[k]
      arr[k] = arr[i]
      arr[i] = temp
      explore(k + 1)
      temp = arr[k] // swap back
      arr[k] = arr[i]
      arr[i] = temp
    }
  }

  explore(0)
  return result
}
