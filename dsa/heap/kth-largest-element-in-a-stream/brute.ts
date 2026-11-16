class KthLargest {
  k: number
  values: number[]

  constructor(k: number, nums: number[]) {
    this.k = k
    this.values = [...nums]
  }

  add(val: number): number {
    this.values.push(val)
    const sorted = [...this.values].sort((a, b) => b - a)
    return sorted[this.k - 1]
  }
}
