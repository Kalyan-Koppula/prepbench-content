class KthLargest {
  k: number
  heap = new PriorityQueue<number>() // min-heap holding the k largest values

  constructor(k: number, nums: number[]) {
    this.k = k
    for (const x of nums) this.add(x)
  }

  add(val: number): number {
    this.heap.push(val)
    if (this.heap.size() > this.k) this.heap.pop()
    return this.heap.peek()!
  }
}
