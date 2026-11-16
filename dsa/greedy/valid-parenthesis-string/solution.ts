function checkValidString(s: string): boolean {
  let lo = 0 // fewest unmatched '(' possible
  let hi = 0 // most unmatched '(' possible
  for (const ch of s) {
    if (ch === '(') {
      lo++
      hi++
    } else if (ch === ')') {
      lo--
      hi--
    } else {
      lo-- // treat '*' as ')'
      hi++ // treat '*' as '('
    }
    if (hi < 0) return false // too many ')' even with every '*' as '('
    lo = Math.max(lo, 0) // a negative count isn't a real option
  }
  return lo === 0
}
