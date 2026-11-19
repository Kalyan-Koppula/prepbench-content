class KthLargest {
  k: number
  values: number[] // kept sorted in descending order

  constructor(k: number, nums: number[]) {
    this.k = k
    this.values = []
    for (let i = 0; i < nums.length; i++) {
      this.insert(nums[i])
    }
  }

  // Insertion into a sorted array: O(n) per value.
  insert(val: number): void {
    let i = this.values.length
    this.values.push(val)
    while (i > 0 && this.values[i - 1] < val) {
      this.values[i] = this.values[i - 1]
      i--
    }
    this.values[i] = val
  }

  add(val: number): number {
    this.insert(val)
    return this.values[this.k - 1]
  }
}
