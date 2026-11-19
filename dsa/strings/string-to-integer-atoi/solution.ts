function myAtoi(s: string): number {
  const INT_MAX = 2147483647
  const INT_MIN = -2147483648
  let i = 0
  while (i < s.length && s[i] === ' ') {
    i++ // 1. skip leading spaces
  }
  let sign = 1
  if (i < s.length && (s[i] === '+' || s[i] === '-')) {
    if (s[i] === '-') {
      sign = -1 // 2. optional sign
    }
    i++
  }
  let value = 0
  while (i < s.length && s[i] >= '0' && s[i] <= '9') {
    const digit = s.charCodeAt(i) - 48 // 3. digits until the first non-digit
    // Would value * 10 + digit exceed INT_MAX? Check before computing it.
    if (value > Math.floor((INT_MAX - digit) / 10)) {
      return sign === 1 ? INT_MAX : INT_MIN // 4. clamp
    }
    value = value * 10 + digit
    i++
  }
  if (value === 0) {
    return 0
  }
  return sign * value
}
