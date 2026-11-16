function reverse(x: number): number {
  const digits = String(Math.abs(x)).split('').reverse().join('')
  const value = Math.sign(x) * Number(digits)
  return value < -(2 ** 31) || value > 2 ** 31 - 1 ? 0 : value
}
