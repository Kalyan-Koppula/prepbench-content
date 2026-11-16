class DetectSquares {
  counts = new Map<number, number>() // encoded point -> copies
  byColumn = new Map<number, Map<number, number>>() // x -> (y -> copies)

  add(point: number[]): void {
    const [x, y] = point
    const key = x * 1001 + y
    this.counts.set(key, (this.counts.get(key) ?? 0) + 1)
    if (!this.byColumn.has(x)) this.byColumn.set(x, new Map())
    const column = this.byColumn.get(x)!
    column.set(y, (column.get(y) ?? 0) + 1)
  }

  count(point: number[]): number {
    const [qx, qy] = point
    const column = this.byColumn.get(qx)
    if (!column) return 0
    const at = (x: number, y: number) => this.counts.get(x * 1001 + y) ?? 0
    let total = 0
    // Pick the corner sharing the query's x; the side length then fixes the rest.
    for (const [y, copies] of column) {
      const side = y - qy
      if (side === 0) continue
      for (const x of [qx - side, qx + side]) {
        total += copies * at(x, qy) * at(x, y)
      }
    }
    return total
  }
}
