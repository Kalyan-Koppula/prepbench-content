function solveNQueens(n: number): string[][] {
  // Try every permutation of columns (one queen per row and column), keep those with no diagonal clash.
  const result: string[][] = []
  const perm: number[] = []
  const gen = () => {
    if (perm.length === n) {
      for (let i = 0; i < n; i++)
        for (let j = i + 1; j < n; j++) if (Math.abs(perm[i] - perm[j]) === j - i) return
      result.push(perm.map((c) => Array.from({ length: n }, (_, x) => (x === c ? 'Q' : '.')).join('')))
      return
    }
    for (let c = 0; c < n; c++) {
      if (perm.includes(c)) continue
      perm.push(c)
      gen()
      perm.pop()
    }
  }
  gen()
  return result
}
