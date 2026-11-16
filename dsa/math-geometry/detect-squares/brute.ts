class DetectSquares {
  points: number[][] = []

  add(point: number[]): void {
    this.points.push(point)
  }

  count(point: number[]): number {
    const [qx, qy] = point
    const howMany = (x: number, y: number) => this.points.filter((p) => p[0] === x && p[1] === y).length
    let total = 0
    // Every stored copy can serve as the diagonal corner.
    for (const [x, y] of this.points) {
      if (x === qx || Math.abs(x - qx) !== Math.abs(y - qy)) continue
      total += howMany(qx, y) * howMany(x, qy)
    }
    return total
  }
}
