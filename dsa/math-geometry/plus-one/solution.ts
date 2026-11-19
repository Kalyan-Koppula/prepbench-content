function plusOne(digits: number[]): number[] {
  const result: number[] = []
  for (let i = 0; i < digits.length; i++) {
    result.push(digits[i])
  }
  for (let i = result.length - 1; i >= 0; i--) {
    if (result[i] < 9) {
      result[i]++
      return result // no carry left to pass on
    }
    result[i] = 0 // 9 + 1 = 10: write 0, carry 1 to the left
  }
  // Every digit was 9: the answer is 1 followed by zeros.
  const grown: number[] = [1]
  for (let i = 0; i < result.length; i++) {
    grown.push(0)
  }
  return grown
}
