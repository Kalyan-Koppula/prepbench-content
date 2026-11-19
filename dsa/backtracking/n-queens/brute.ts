function solveNQueens(n: number): string[][] {
  // Try every permutation of columns (one queen per row and column), and keep
  // those with no diagonal clash. Checks happen only at the end: O(n! * n^2).
  const result: string[][] = []
  const perm: number[] = []
  const used = new Array(n).fill(false)

  function explore(): void {
    if (perm.length === n) {
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          if (Math.abs(perm[i] - perm[j]) === j - i) {
            return // same diagonal
          }
        }
      }
      const rows: string[] = []
      for (let r = 0; r < n; r++) {
        let row = ''
        for (let c = 0; c < n; c++) {
          row += c === perm[r] ? 'Q' : '.'
        }
        rows.push(row)
      }
      result.push(rows)
      return
    }
    for (let c = 0; c < n; c++) {
      if (used[c]) {
        continue
      }
      used[c] = true
      perm.push(c)
      explore()
      perm.pop()
      used[c] = false
    }
  }

  explore()
  return result
}
