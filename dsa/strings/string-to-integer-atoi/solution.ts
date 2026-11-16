function myAtoi(s: string): number {
  const INT_MAX = 2 ** 31 - 1
  let i = 0
  while (i < s.length && s[i] === ' ') i++

  let sign = 1
  if (s[i] === '+' || s[i] === '-') {
    if (s[i] === '-') sign = -1
    i++
  }

  const limit = sign === 1 ? INT_MAX : INT_MAX + 1
  let value = 0
  while (i < s.length && s[i] >= '0' && s[i] <= '9') {
    value = value * 10 + (s.charCodeAt(i) - 48)
    if (value > limit) return sign * limit // clamp as soon as we overflow
    i++
  }
  return value === 0 ? 0 : sign * value
}
