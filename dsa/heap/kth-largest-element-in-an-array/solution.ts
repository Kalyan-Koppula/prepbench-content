function findKthLargest(nums: number[], k: number): number {
  // Min-heap of the k largest values seen so far.
  const heap = new PriorityQueue<number>((a, b) => a - b)
  for (let i = 0; i < nums.length; i++) {
    heap.push(nums[i])
    if (heap.size() > k) {
      heap.pop()
    }
  }
  return heap.peek() as number
}
