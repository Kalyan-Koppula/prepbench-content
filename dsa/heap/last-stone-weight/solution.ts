function lastStoneWeight(stones: number[]): number {
  const heap = new PriorityQueue<number>((a, b) => b - a) // max-heap
  for (let i = 0; i < stones.length; i++) {
    heap.push(stones[i])
  }
  while (heap.size() > 1) {
    const heaviest = heap.pop() as number
    const second = heap.pop() as number
    if (heaviest > second) {
      heap.push(heaviest - second) // the remainder goes back into the pile
    }
  }
  if (heap.isEmpty()) {
    return 0
  }
  return heap.peek() as number
}
