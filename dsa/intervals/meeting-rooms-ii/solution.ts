function minMeetingRooms(intervals: number[][]): number {
  const n = intervals.length
  const starts: number[] = []
  const ends: number[] = []
  for (let i = 0; i < n; i++) {
    starts.push(intervals[i][0])
    ends.push(intervals[i][1])
  }
  starts.sort((a, b) => a - b)
  ends.sort((a, b) => a - b)

  let inUse = 0
  let most = 0
  let e = 0 // next meeting end to process
  for (let s = 0; s < n; s++) {
    // Meetings that ended by this start time free their rooms ([start, end) intervals).
    while (ends[e] <= starts[s]) {
      inUse--
      e++
    }
    inUse++
    if (inUse > most) {
      most = inUse
    }
  }
  return most
}
