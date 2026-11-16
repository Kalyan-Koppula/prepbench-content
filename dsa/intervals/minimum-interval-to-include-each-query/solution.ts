function minInterval(intervals: number[][], queries: number[]): number[] {
  const sorted = [...intervals].sort((a, b) => a[0] - b[0])
  const order = queries.map((_, i) => i).sort((a, b) => queries[a] - queries[b])
  // Min-heap of [size, right] for intervals whose left edge we've passed.
  const heap = new PriorityQueue<number[]>((a, b) => a[0] - b[0])
  const answer = new Array(queries.length).fill(-1)
  let i = 0
  for (const qi of order) {
    const q = queries[qi]
    while (i < sorted.length && sorted[i][0] <= q) {
      const [left, right] = sorted[i++]
      heap.push([right - left + 1, right])
    }
    // Lazily drop intervals that end before q; later queries are larger, so they're useless forever.
    while (!heap.isEmpty() && heap.peek()![1] < q) heap.pop()
    if (!heap.isEmpty()) answer[qi] = heap.peek()![0]
  }
  return answer
}
