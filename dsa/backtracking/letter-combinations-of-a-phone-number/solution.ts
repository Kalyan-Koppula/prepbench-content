const KEYPAD: Record<string, string> = {
  '2': 'abc', '3': 'def', '4': 'ghi', '5': 'jkl',
  '6': 'mno', '7': 'pqrs', '8': 'tuv', '9': 'wxyz',
}

function letterCombinations(digits: string): string[] {
  if (digits.length === 0) return []
  const result: string[] = []
  const path: string[] = []

  const backtrack = (i: number) => {
    if (i === digits.length) {
      result.push(path.join(''))
      return
    }
    for (const letter of KEYPAD[digits[i]]) {
      path.push(letter)
      backtrack(i + 1)
      path.pop()
    }
  }

  backtrack(0)
  return result
}
