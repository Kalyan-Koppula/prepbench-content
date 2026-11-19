// Top-down recursion with memoisation over suffixes:
// matches(i, j) = s[i..] matches p[j..].
function isMatch(s: string, p: string): boolean {
  const memo: number[][] = [] // -1 unknown, 0 false, 1 true
  for (let i = 0; i <= s.length; i++) {
    memo.push(new Array(p.length + 1).fill(-1))
  }
  return matches(s, p, 0, 0, memo)
}

function matches(s: string, p: string, i: number, j: number, memo: number[][]): boolean {
  if (j === p.length) {
    return i === s.length
  }
  if (memo[i][j] !== -1) {
    return memo[i][j] === 1
  }
  const firstMatches = i < s.length && (p[j] === '.' || p[j] === s[i])
  let result: boolean
  if (j + 1 < p.length && p[j + 1] === '*') {
    // Skip "x*" entirely, or use it for one character and stay on it.
    result = matches(s, p, i, j + 2, memo) || (firstMatches && matches(s, p, i + 1, j, memo))
  } else {
    result = firstMatches && matches(s, p, i + 1, j + 1, memo)
  }
  memo[i][j] = result ? 1 : 0
  return result
}
