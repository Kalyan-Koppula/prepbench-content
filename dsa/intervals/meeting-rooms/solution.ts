function canAttendMeetings(intervals: number[][]): boolean {
  const sorted: number[][] = []
  for (let i = 0; i < intervals.length; i++) {
    sorted.push(intervals[i])
  }
  sorted.sort((a, b) => a[0] - b[0]) // by start time
  for (let i = 1; i < sorted.length; i++) {
    // After sorting, only neighbours can clash first.
    if (sorted[i][0] < sorted[i - 1][1]) {
      return false
    }
  }
  return true
}
