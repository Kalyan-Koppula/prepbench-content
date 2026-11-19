// The peak is always at some meeting's start. For each start time,
// count the meetings in progress. O(n^2).
function minMeetingRooms(intervals: number[][]): number {
  let best = 0
  for (let k = 0; k < intervals.length; k++) {
    const t = intervals[k][0]
    let active = 0
    for (let i = 0; i < intervals.length; i++) {
      if (intervals[i][0] <= t && t < intervals[i][1]) {
        active++
      }
    }
    if (active > best) {
      best = active
    }
  }
  return best
}
