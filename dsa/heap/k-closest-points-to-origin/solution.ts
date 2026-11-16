function kClosest(points: number[][], k: number): number[][] {
  const dist = (p: number[]) => p[0] * p[0] + p[1] * p[1]
  // Max-heap by distance: the top is the farthest of the k kept so far.
  const heap = new PriorityQueue<number[]>((a, b) => dist(b) - dist(a))
  for (const p of points) {
    heap.push(p)
    if (heap.size() > k) heap.pop()
  }
  return heap.toArray()
}
