function lastStoneWeight(stones: number[]): number {
  const heap = new PriorityQueue<number>((a, b) => b - a) // max-heap
  for (const s of stones) heap.push(s)
  while (heap.size() > 1) {
    const y = heap.pop()!
    const x = heap.pop()!
    if (y > x) heap.push(y - x)
  }
  return heap.isEmpty() ? 0 : heap.peek()!
}
