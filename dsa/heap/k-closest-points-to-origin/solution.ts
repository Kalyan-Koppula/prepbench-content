function squaredDistance(p: number[]): number {
  return p[0] * p[0] + p[1] * p[1] // same order as the real distance, no square root
}

function kClosest(points: number[][], k: number): number[][] {
  // Max-heap by distance: the top is the farthest of the k kept so far.
  const heap = new PriorityQueue<number[]>((a, b) => squaredDistance(b) - squaredDistance(a))
  for (let i = 0; i < points.length; i++) {
    heap.push(points[i])
    if (heap.size() > k) {
      heap.pop() // drop the farthest
    }
  }
  const result: number[][] = []
  while (!heap.isEmpty()) {
    result.push(heap.pop() as number[])
  }
  return result
}
