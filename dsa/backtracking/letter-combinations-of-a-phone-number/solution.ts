const KEYPAD = ['', '', 'abc', 'def', 'ghi', 'jkl', 'mno', 'pqrs', 'tuv', 'wxyz']

function letterCombinations(digits: string): string[] {
  const result: string[] = []
  if (digits.length === 0) {
    return result
  }
  const path: string[] = []

  // Position i gets one of the letters of digits[i].
  function explore(i: number): void {
    if (i === digits.length) {
      result.push(path.join(''))
      return
    }
    const letters = KEYPAD[digits.charCodeAt(i) - 48]
    for (let j = 0; j < letters.length; j++) {
      path.push(letters[j])
      explore(i + 1)
      path.pop()
    }
  }

  explore(0)
  return result
}
