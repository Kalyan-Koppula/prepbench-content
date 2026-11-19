// Top-down recursion with memoisation over suffixes:
// count(i, j) = ways to form t[j..] from s[i..].
function numDistinct(s: string, t: string): number {
  const memo: number[][] = []
  for (let i = 0; i <= s.length; i++) {
    memo.push(new Array(t.length + 1).fill(-1))
  }
  return countFrom(s, t, 0, 0, memo)
}

function countFrom(s: string, t: string, i: number, j: number, memo: number[][]): number {
  if (j === t.length) {
    return 1
  }
  if (s.length - i < t.length - j) {
    return 0 // not enough characters left
  }
  if (memo[i][j] !== -1) {
    return memo[i][j]
  }
  let total = countFrom(s, t, i + 1, j, memo) // skip s[i]
  if (s[i] === t[j]) {
    total += countFrom(s, t, i + 1, j + 1, memo) // match s[i] with t[j]
  }
  memo[i][j] = total
  return total
}
