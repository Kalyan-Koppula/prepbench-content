function checkValidString(s: string): boolean {
  let low = 0 // fewest unmatched '(' we could have
  let high = 0 // most unmatched '(' we could have
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]
    if (ch === '(') {
      low++
      high++
    } else if (ch === ')') {
      low--
      high--
    } else {
      low-- // treat '*' as ')'
      high++ // treat '*' as '('
    }
    if (high < 0) {
      return false // too many ')' even if every '*' were '('
    }
    if (low < 0) {
      low = 0 // a negative count isn't possible; that choice of '*' is discarded
    }
  }
  return low === 0
}
