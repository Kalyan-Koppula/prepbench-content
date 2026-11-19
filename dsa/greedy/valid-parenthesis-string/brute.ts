// Track every possible number of unmatched '(' after each character.
// possible[k] = true if some choice of the '*'s so far leaves k open. O(n^2).
function checkValidString(s: string): boolean {
  const n = s.length
  let possible = new Array(n + 2).fill(false)
  possible[0] = true
  for (let i = 0; i < n; i++) {
    const ch = s[i]
    const next = new Array(n + 2).fill(false)
    for (let open = 0; open <= n; open++) {
      if (!possible[open]) {
        continue
      }
      if (ch === '(' || ch === '*') {
        next[open + 1] = true
      }
      if ((ch === ')' || ch === '*') && open > 0) {
        next[open - 1] = true
      }
      if (ch === '*') {
        next[open] = true // '*' as the empty string
      }
    }
    possible = next
  }
  return possible[0]
}
