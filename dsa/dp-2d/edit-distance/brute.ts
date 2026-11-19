// Top-down recursion with memoisation over suffixes:
// cost(i, j) = fewest edits to turn word1[i..] into word2[j..].
function minDistance(word1: string, word2: string): number {
  const memo: number[][] = []
  for (let i = 0; i <= word1.length; i++) {
    memo.push(new Array(word2.length + 1).fill(-1))
  }
  return cost(word1, word2, 0, 0, memo)
}

function cost(a: string, b: string, i: number, j: number, memo: number[][]): number {
  if (i === a.length) {
    return b.length - j // insert the rest of b
  }
  if (j === b.length) {
    return a.length - i // delete the rest of a
  }
  if (memo[i][j] !== -1) {
    return memo[i][j]
  }
  let result: number
  if (a[i] === b[j]) {
    result = cost(a, b, i + 1, j + 1, memo)
  } else {
    const replace = cost(a, b, i + 1, j + 1, memo)
    const remove = cost(a, b, i + 1, j, memo)
    const insert = cost(a, b, i, j + 1, memo)
    result = 1 + Math.min(replace, Math.min(remove, insert))
  }
  memo[i][j] = result
  return result
}
