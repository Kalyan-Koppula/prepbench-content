function threeSum(nums: number[]): number[][] {
  const a = [...nums].sort((x, y) => x - y)
  const result: number[][] = []
  for (let i = 0; i < a.length - 2 && a[i] <= 0; i++) {
    if (i > 0 && a[i] === a[i - 1]) continue // same anchor as before
    let l = i + 1
    let r = a.length - 1
    while (l < r) {
      const sum = a[i] + a[l] + a[r]
      if (sum < 0) l++
      else if (sum > 0) r--
      else {
        result.push([a[i], a[l], a[r]])
        l++
        r--
        while (l < r && a[l] === a[l - 1]) l++ // skip duplicate second values
      }
    }
  }
  return result
}
