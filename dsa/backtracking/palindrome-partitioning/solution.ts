function partition(s: string): string[][] {
  const n = s.length
  // isPal[i][j]: s[i..j] is a palindrome. Fill from shorter to longer spans.
  const isPal = Array.from({ length: n }, () => new Array<boolean>(n).fill(false))
  for (let i = n - 1; i >= 0; i--) {
    for (let j = i; j < n; j++) {
      isPal[i][j] = s[i] === s[j] && (j - i < 2 || isPal[i + 1][j - 1])
    }
  }

  const result: string[][] = []
  const path: string[] = []
  const backtrack = (start: number) => {
    if (start === n) {
      result.push([...path])
      return
    }
    for (let end = start; end < n; end++) {
      if (!isPal[start][end]) continue
      path.push(s.slice(start, end + 1))
      backtrack(end + 1)
      path.pop()
    }
  }

  backtrack(0)
  return result
}
