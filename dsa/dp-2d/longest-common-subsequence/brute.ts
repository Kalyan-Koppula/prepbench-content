// Top-down recursion with memoisation over suffixes: best(i, j) = LCS of text1[i..] and text2[j..].
function longestCommonSubsequence(text1: string, text2: string): number {
  const memo: number[][] = []
  for (let i = 0; i < text1.length; i++) {
    memo.push(new Array(text2.length).fill(-1))
  }
  return best(text1, text2, 0, 0, memo)
}

function best(a: string, b: string, i: number, j: number, memo: number[][]): number {
  if (i === a.length || j === b.length) {
    return 0
  }
  if (memo[i][j] !== -1) {
    return memo[i][j]
  }
  let result: number
  if (a[i] === b[j]) {
    result = 1 + best(a, b, i + 1, j + 1, memo)
  } else {
    result = Math.max(best(a, b, i + 1, j, memo), best(a, b, i, j + 1, memo))
  }
  memo[i][j] = result
  return result
}
