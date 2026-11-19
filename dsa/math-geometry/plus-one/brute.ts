// General schoolbook addition of two digit arrays, used to add [1].
function plusOne(digits: number[]): number[] {
  const other = [1]
  const reversed: number[] = []
  let i = digits.length - 1
  let j = other.length - 1
  let carry = 0
  while (i >= 0 || j >= 0 || carry > 0) {
    let sum = carry
    if (i >= 0) {
      sum += digits[i]
      i--
    }
    if (j >= 0) {
      sum += other[j]
      j--
    }
    reversed.push(sum % 10)
    carry = Math.floor(sum / 10)
  }
  const result: number[] = []
  for (let k = reversed.length - 1; k >= 0; k--) {
    result.push(reversed[k])
  }
  return result
}
