function getPermutation(n: number, k: number): string {
  // Start from 1..n and apply "next permutation" k - 1 times: O(k * n).
  const a: number[] = []
  for (let i = 1; i <= n; i++) {
    a.push(i)
  }
  for (let step = 1; step < k; step++) {
    let i = n - 2
    while (i >= 0 && a[i] > a[i + 1]) {
      i--
    }
    let j = n - 1
    while (a[j] < a[i]) {
      j--
    }
    let temp = a[i]
    a[i] = a[j]
    a[j] = temp
    let left = i + 1
    let right = n - 1
    while (left < right) {
      temp = a[left]
      a[left] = a[right]
      a[right] = temp
      left++
      right--
    }
  }
  let result = ''
  for (let i = 0; i < n; i++) {
    result += String(a[i])
  }
  return result
}
