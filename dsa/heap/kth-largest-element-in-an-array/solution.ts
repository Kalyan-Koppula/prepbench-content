function findKthLargest(nums: number[], k: number): number {
  const heap = new PriorityQueue<number>() // min-heap of the k largest so far
  for (const x of nums) {
    heap.push(x)
    if (heap.size() > k) heap.pop()
  }
  return heap.peek()!
}
