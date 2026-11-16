function multiply(num1: string, num2: string): string {
  if (num1 === '0' || num2 === '0') return '0'
  const m = num1.length
  const n = num2.length
  const digits: number[] = new Array(m + n).fill(0)

  for (let i = m - 1; i >= 0; i--) {
    const a = num1.charCodeAt(i) - 48
    for (let j = n - 1; j >= 0; j--) {
      const b = num2.charCodeAt(j) - 48
      // Position i + j + 1 is the ones place of this partial product.
      const sum = digits[i + j + 1] + a * b
      digits[i + j + 1] = sum % 10
      digits[i + j] += Math.floor(sum / 10)
    }
  }

  const start = digits[0] === 0 ? 1 : 0
  return digits.slice(start).join('')
}
