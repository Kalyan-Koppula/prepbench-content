function getPermutation(n: number, k: number): string {
  const digits: number[] = [] // digits still available, in increasing order
  const factorial: number[] = [1]
  for (let i = 1; i <= n; i++) {
    digits.push(i)
    factorial.push(factorial[i - 1] * i)
  }
  let rank = k - 1 // 0-based position in the sorted list
  let result = ''
  for (let remaining = n; remaining > 0; remaining--) {
    // Each choice of the next digit starts a block of (remaining - 1)! permutations.
    const block = factorial[remaining - 1]
    const index = Math.floor(rank / block)
    result += String(digits[index])
    // Remove the chosen digit, keeping the rest in order.
    for (let j = index; j < digits.length - 1; j++) {
      digits[j] = digits[j + 1]
    }
    digits.pop()
    rank = rank % block // position inside that block
  }
  return result
}
