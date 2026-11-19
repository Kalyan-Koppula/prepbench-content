function reverse(x: number): number {
  const MAX = 2147483647 // 2^31 - 1
  const MIN = -2147483648 // -2^31
  let reversed = 0
  while (x !== 0) {
    const digit = x % 10 // keeps the sign of x
    x = Math.trunc(x / 10) // division rounding toward zero (plain "/" on ints in Java or C++)
    // Would reversed * 10 + digit leave the 32-bit range? Check before computing it.
    if (reversed > MAX / 10 || (reversed === Math.trunc(MAX / 10) && digit > 7)) {
      return 0
    }
    if (reversed < MIN / 10 || (reversed === Math.trunc(MIN / 10) && digit < -8)) {
      return 0
    }
    reversed = reversed * 10 + digit
  }
  return reversed
}
