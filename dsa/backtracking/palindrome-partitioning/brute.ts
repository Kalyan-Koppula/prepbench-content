function partition(s: string): string[][] {
  // Each of the n - 1 gaps is either a cut or not.
  const isPal = (t: string) => t === [...t].reverse().join('')
  const result: string[][] = []
  for (let mask = 0; mask < 1 << (s.length - 1); mask++) {
    const pieces: string[] = []
    let from = 0
    for (let gap = 0; gap < s.length - 1; gap++) {
      if (mask & (1 << gap)) {
        pieces.push(s.slice(from, gap + 1))
        from = gap + 1
      }
    }
    pieces.push(s.slice(from))
    if (pieces.every(isPal)) result.push(pieces)
  }
  return result
}
