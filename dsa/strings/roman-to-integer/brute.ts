// Read greedily from the left, trying the six two-letter subtractive forms first.
function romanToInt(s: string): number {
  const values = new Map<string, number>()
  values.set('CM', 900)
  values.set('CD', 400)
  values.set('XC', 90)
  values.set('XL', 40)
  values.set('IX', 9)
  values.set('IV', 4)
  values.set('M', 1000)
  values.set('D', 500)
  values.set('C', 100)
  values.set('L', 50)
  values.set('X', 10)
  values.set('V', 5)
  values.set('I', 1)
  let total = 0
  let i = 0
  while (i < s.length) {
    const two = s.substring(i, i + 2)
    if (two.length === 2 && values.has(two)) {
      total += values.get(two) as number
      i += 2
    } else {
      total += values.get(s[i]) as number
      i++
    }
  }
  return total
}
