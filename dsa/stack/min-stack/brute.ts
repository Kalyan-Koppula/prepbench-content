class MinStack {
  values: number[]

  constructor() {
    this.values = []
  }

  push(val: number): void {
    this.values.push(val)
  }

  pop(): void {
    this.values.pop()
  }

  top(): number {
    return this.values[this.values.length - 1]
  }

  // O(n): scan everything on the stack.
  getMin(): number {
    let min = this.values[0]
    for (let i = 1; i < this.values.length; i++) {
      if (this.values[i] < min) {
        min = this.values[i]
      }
    }
    return min
  }
}
