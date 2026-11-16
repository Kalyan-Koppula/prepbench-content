function minMeetingRooms(intervals: number[][]): number {
  // Peak overlap always occurs at some meeting's start time.
  let best = 0
  for (const [t] of intervals) {
    let active = 0
    for (const [s, e] of intervals) if (s <= t && t < e) active++
    best = Math.max(best, active)
  }
  return best
}
