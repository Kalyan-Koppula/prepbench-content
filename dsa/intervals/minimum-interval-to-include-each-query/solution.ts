function minInterval(intervals: number[][], queries: number[]): number[] {
  const sorted: number[][] = []
  for (let i = 0; i < intervals.length; i++) {
    sorted.push(intervals[i])
  }
  sorted.sort((a, b) => a[0] - b[0]) // by left edge
  // Answer queries in increasing order, remembering where each one came from.
  const order: number[] = []
  for (let i = 0; i < queries.length; i++) {
    order.push(i)
  }
  order.sort((a, b) => queries[a] - queries[b])

  // Min-heap of [size, right] for intervals that start at or before the current query.
  const heap = new PriorityQueue<number[]>((a, b) => a[0] - b[0])
  const answer = new Array(queries.length).fill(-1)
  let next = 0
  for (let k = 0; k < order.length; k++) {
    const q = queries[order[k]]
    while (next < sorted.length && sorted[next][0] <= q) {
      const left = sorted[next][0]
      const right = sorted[next][1]
      heap.push([right - left + 1, right])
      next++
    }
    // Drop intervals that end before q. Later queries are larger, so they never matter again.
    while (!heap.isEmpty() && (heap.peek() as number[])[1] < q) {
      heap.pop()
    }
    if (!heap.isEmpty()) {
      answer[order[k]] = (heap.peek() as number[])[0]
    }
  }
  return answer
}
