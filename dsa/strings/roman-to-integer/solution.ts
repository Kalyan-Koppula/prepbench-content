function romanToInt(s: string): number {
  let total = 0
  for (let i = 0; i < s.length; i++) {
    const current = symbolValue(s[i])
    // A smaller symbol written before a larger one is subtracted (IV = 4, CM = 900).
    if (i + 1 < s.length && symbolValue(s[i + 1]) > current) {
      total -= current
    } else {
      total += current
    }
  }
  return total
}

function symbolValue(c: string): number {
  switch (c) {
    case 'I':
      return 1
    case 'V':
      return 5
    case 'X':
      return 10
    case 'L':
      return 50
    case 'C':
      return 100
    case 'D':
      return 500
    case 'M':
      return 1000
    default:
      return 0
  }
}
