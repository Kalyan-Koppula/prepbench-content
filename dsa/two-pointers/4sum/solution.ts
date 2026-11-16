function fourSum(nums: number[], target: number): number[][] {
  const a = [...nums].sort((x, y) => x - y)
  const n = a.length
  const result: number[][] = []
  for (let i = 0; i < n - 3; i++) {
    if (i > 0 && a[i] === a[i - 1]) continue
    for (let j = i + 1; j < n - 2; j++) {
      if (j > i + 1 && a[j] === a[j - 1]) continue
      let l = j + 1
      let r = n - 1
      while (l < r) {
        const sum = a[i] + a[j] + a[l] + a[r]
        if (sum < target) l++
        else if (sum > target) r--
        else {
          result.push([a[i], a[j], a[l], a[r]])
          l++
          r--
          while (l < r && a[l] === a[l - 1]) l++
        }
      }
    }
  }
  return result
}
