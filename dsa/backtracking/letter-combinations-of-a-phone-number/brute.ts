const KEYS = ['', '', 'abc', 'def', 'ghi', 'jkl', 'mno', 'pqrs', 'tuv', 'wxyz']

function letterCombinations(digits: string): string[] {
  if (digits.length === 0) {
    return []
  }
  // Iterative: extend every combination so far with each letter of the next digit.
  let combos: string[] = ['']
  for (let i = 0; i < digits.length; i++) {
    const letters = KEYS[digits.charCodeAt(i) - 48]
    const next: string[] = []
    for (let p = 0; p < combos.length; p++) {
      for (let j = 0; j < letters.length; j++) {
        next.push(combos[p] + letters[j])
      }
    }
    combos = next
  }
  return combos
}
