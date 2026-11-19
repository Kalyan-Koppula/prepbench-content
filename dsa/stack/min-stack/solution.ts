class MinStack {
  values: number[]
  mins: number[] // mins[i] = smallest of values[0..i]

  constructor() {
    this.values = []
    this.mins = []
  }

  push(val: number): void {
    this.values.push(val)
    if (this.mins.length === 0) {
      this.mins.push(val)
    } else {
      const below = this.mins[this.mins.length - 1]
      this.mins.push(val < below ? val : below)
    }
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
