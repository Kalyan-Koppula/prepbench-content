function letterCombinations(digits: string): string[] {
  if (digits.length === 0) return []
  const keys = ['', '', 'abc', 'def', 'ghi', 'jkl', 'mno', 'pqrs', 'tuv', 'wxyz']
  let combos = ['']
  for (const d of digits) {
    const next: string[] = []
    for (const prefix of combos) for (const ch of keys[Number(d)]) next.push(prefix + ch)
    combos = next
  }
  return combos
}
