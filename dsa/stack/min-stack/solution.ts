class MinStack {
  values: number[] = []
  mins: number[] = [] // mins[i] = minimum of values[0..i]

  push(val: number): void {
    this.values.push(val)
    const below = this.mins.length ? this.mins[this.mins.length - 1] : val
    this.mins.push(Math.min(val, below))
  }

  pop(): void {
    this.values.pop()
    this.mins.pop()
  }

  top(): number {
    return this.values[this.values.length - 1]
  }

  getMin(): number {
    return this.mins[this.mins.length - 1]
  }
}
