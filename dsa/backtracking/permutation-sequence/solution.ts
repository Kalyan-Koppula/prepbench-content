function getPermutation(n: number, k: number): string {
  const digits: number[] = []
  const factorial = [1]
  for (let i = 1; i <= n; i++) {
    digits.push(i)
    factorial[i] = factorial[i - 1] * i
  }

  let rank = k - 1 // 0-indexed position in the sorted list
  let result = ''
  for (let remaining = n; remaining > 0; remaining--) {
    // Each choice of the next digit covers a block of (remaining - 1)! permutations.
    const block = factorial[remaining - 1]
    const index = Math.floor(rank / block)
    result += digits[index]
    digits.splice(index, 1)
    rank %= block
  }
  return result
}
