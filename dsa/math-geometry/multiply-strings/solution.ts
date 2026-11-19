function multiply(num1: string, num2: string): string {
  if (num1 === '0' || num2 === '0') {
    return '0'
  }
  const m = num1.length
  const n = num2.length
  // The product has at most m + n digits; digits[0] is the most significant.
  const digits = new Array(m + n).fill(0)
  for (let i = m - 1; i >= 0; i--) {
    const a = num1.charCodeAt(i) - 48
    for (let j = n - 1; j >= 0; j--) {
      const b = num2.charCodeAt(j) - 48
      // num1[i] * num2[j] lands on positions i + j (tens) and i + j + 1 (ones).
      const sum = digits[i + j + 1] + a * b
      digits[i + j + 1] = sum % 10
      digits[i + j] += Math.floor(sum / 10)
    }
  }
  let result = ''
  let start = 0
  while (start < digits.length - 1 && digits[start] === 0) {
    start++ // skip a leading zero
  }
  for (let k = start; k < digits.length; k++) {
    result += String(digits[k])
  }
  return result
}
