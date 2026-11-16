function minMeetingRooms(intervals: number[][]): number {
  const sorted = [...intervals].sort((a, b) => a[0] - b[0])
  const endTimes = new PriorityQueue<number>() // min-heap: one entry per room in use
  for (const [start, end] of sorted) {
    // Reuse the room that frees up earliest, if it's free by now.
    if (!endTimes.isEmpty() && endTimes.peek()! <= start) endTimes.pop()
    endTimes.push(end)
  }
  return endTimes.size()
}
