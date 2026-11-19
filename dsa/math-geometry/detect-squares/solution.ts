class DetectSquares {
  pointCount: Map<number, number> // encoded point -> number of copies
  points: number[][] // one entry per distinct point

  constructor() {
    this.pointCount = new Map<number, number>()
    this.points = []
  }

  add(point: number[]): void {
    const key = point[0] * 1001 + point[1] // coordinates are 0..1000
    if (this.pointCount.has(key)) {
      this.pointCount.set(key, (this.pointCount.get(key) as number) + 1)
    } else {
      this.pointCount.set(key, 1)
      this.points.push([point[0], point[1]])
    }
  }

  count(point: number[]): number {
    const qx = point[0]
    const qy = point[1]
    let total = 0
    // Each stored point that could be the corner DIAGONALLY opposite the query
    // fixes the whole square; the other two corners must exist too.
    for (let i = 0; i < this.points.length; i++) {
      const x = this.points[i][0]
      const y = this.points[i][1]
      if (x === qx || Math.abs(x - qx) !== Math.abs(y - qy)) {
        continue // same column, or not a square's diagonal
      }
      total += this.copies(x, y) * this.copies(qx, y) * this.copies(x, qy)
    }
    return total
  }

  copies(x: number, y: number): number {
    const key = x * 1001 + y
    return this.pointCount.has(key) ? (this.pointCount.get(key) as number) : 0
  }
}
