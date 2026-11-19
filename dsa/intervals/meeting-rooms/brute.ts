// Compare every pair: two meetings clash when the later start is before the earlier end.
function canAttendMeetings(intervals: number[][]): boolean {
  for (let i = 0; i < intervals.length; i++) {
    for (let j = i + 1; j < intervals.length; j++) {
      const latestStart = Math.max(intervals[i][0], intervals[j][0])
      const earliestEnd = Math.min(intervals[i][1], intervals[j][1])
      if (latestStart < earliestEnd) {
        return false
      }
    }
  }
  return true
}
