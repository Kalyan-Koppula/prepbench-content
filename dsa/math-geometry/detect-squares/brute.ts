// Store every added point as-is (duplicates included) and count copies by scanning.
class DetectSquares {
  points: number[][]

  constructor() {
    this.points = []
  }

  add(point: number[]): void {
    this.points.push([point[0], point[1]])
  }

  count(point: number[]): number {
    const qx = point[0]
    const qy = point[1]
    let total = 0
    // Every stored copy can serve as the diagonal corner.
    for (let i = 0; i < this.points.length; i++) {
      const x = this.points[i][0]
      const y = this.points[i][1]
      if (x === qx || Math.abs(x - qx) !== Math.abs(y - qy)) {
        continue
      }
      total += this.howMany(qx, y) * this.howMany(x, qy)
    }
    return total
  }

  howMany(x: number, y: number): number {
    let found = 0
    for (let i = 0; i < this.points.length; i++) {
      if (this.points[i][0] === x && this.points[i][1] === y) {
        found++
      }
    }
    return found
  }
}
