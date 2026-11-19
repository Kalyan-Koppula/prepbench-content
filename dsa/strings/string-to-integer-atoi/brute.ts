// Collect the digit run as a string first, then decide by its length:
// more than 10 significant digits always overflows; otherwise convert in a wide type.
function myAtoi(s: string): number {
  let i = 0
  while (i < s.length && s[i] === ' ') {
    i++
  }
  let negative = false
  if (i < s.length && (s[i] === '+' || s[i] === '-')) {
    negative = s[i] === '-'
    i++
  }
  let digits = ''
  while (i < s.length && s[i] >= '0' && s[i] <= '9') {
    if (!(digits.length === 0 && s[i] === '0')) {
      digits += s[i] // drop leading zeros
    }
    i++
  }
  const limit = negative ? 2147483648 : 2147483647
  if (digits.length > 10) {
    return negative ? -limit : limit
  }
  let value = 0 // at most 10 digits: exact in a 64-bit integer or a double
  for (let k = 0; k < digits.length; k++) {
    value = value * 10 + (digits.charCodeAt(k) - 48)
  }
  if (value > limit) {
    value = limit
  }
  if (value === 0) {
    return 0
  }
  return negative ? -value : value
}
