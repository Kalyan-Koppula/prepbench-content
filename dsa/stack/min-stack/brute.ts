class MinStack {
  values: number[] = []

  push(val: number): void {
    this.values.push(val)
  }

  pop(): void {
    this.values.pop()
  }

  top(): number {
    return this.values[this.values.length - 1]
  }

  getMin(): number {
    let min = Infinity
    for (const v of this.values) min = Math.min(min, v)
    return min
  }
}
