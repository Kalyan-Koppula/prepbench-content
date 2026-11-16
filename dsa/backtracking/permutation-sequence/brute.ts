function getPermutation(n: number, k: number): string {
  // Step through permutations in lexicographic order with next-permutation.
  const a = Array.from({ length: n }, (_, i) => i + 1)
  for (let step = 1; step < k; step++) {
    let i = n - 2
    while (a[i] > a[i + 1]) i--
    let j = n - 1
    while (a[j] < a[i]) j--
    ;[a[i], a[j]] = [a[j], a[i]]
    for (let l = i + 1, r = n - 1; l < r; l++, r--) [a[l], a[r]] = [a[r], a[l]]
  }
  return a.join('')
}
