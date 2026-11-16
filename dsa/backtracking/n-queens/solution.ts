function solveNQueens(n: number): string[][] {
  const result: string[][] = []
  const queenCol: number[] = [] // queenCol[r] = column of the queen in row r
  const cols = new Set<number>()
  const diag = new Set<number>() // r - c is constant along a "\" diagonal
  const anti = new Set<number>() // r + c is constant along a "/" diagonal

  const place = (r: number) => {
    if (r === n) {
      result.push(queenCol.map((c) => '.'.repeat(c) + 'Q' + '.'.repeat(n - c - 1)))
      return
    }
    for (let c = 0; c < n; c++) {
      if (cols.has(c) || diag.has(r - c) || anti.has(r + c)) continue
      cols.add(c)
      diag.add(r - c)
      anti.add(r + c)
      queenCol.push(c)
      place(r + 1)
      queenCol.pop()
      cols.delete(c)
      diag.delete(r - c)
      anti.delete(r + c)
    }
  }

  place(0)
  return result
}
