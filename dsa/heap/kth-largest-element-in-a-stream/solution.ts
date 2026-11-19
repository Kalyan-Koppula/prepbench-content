class KthLargest {
  k: number
  heap: PriorityQueue<number> // min-heap holding the k largest values so far

  constructor(k: number, nums: number[]) {
    this.k = k
    this.heap = new PriorityQueue<number>((a, b) => a - b)
    for (let i = 0; i < nums.length; i++) {
      this.add(nums[i])
    }
  }

  add(val: number): number {
    this.heap.push(val)
    if (this.heap.size() > this.k) {
      this.heap.pop() // the smallest can't be among the k largest
    }
    return this.heap.peek() as number // the weakest of the top k is the kth largest
  }
}
