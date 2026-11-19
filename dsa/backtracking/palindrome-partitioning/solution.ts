function partition(s: string): string[][] {
  const n = s.length
  // isPal[i][j]: s[i..j] is a palindrome. Filled from the end so the inner span is ready.
  const isPal: boolean[][] = []
  for (let i = 0; i < n; i++) {
    isPal.push(new Array(n).fill(false))
  }
  for (let i = n - 1; i >= 0; i--) {
    for (let j = i; j < n; j++) {
      isPal[i][j] = s[i] === s[j] && (j - i < 2 || isPal[i + 1][j - 1])
    }
  }

  const result: string[][] = []
  const path: string[] = []

  // Choose where the next piece, starting at `start`, ends.
  function explore(start: number): void {
    if (start === n) {
      result.push(path.slice())
      return
    }
    for (let end = start; end < n; end++) {
      if (!isPal[start][end]) {
        continue // prune: this piece isn't a palindrome
      }
      path.push(s.substring(start, end + 1))
      explore(end + 1)
      path.pop()
    }
  }

  explore(0)
  return result
}
