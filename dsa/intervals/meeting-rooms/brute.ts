function canAttendMeetings(intervals: number[][]): boolean {
  for (let i = 0; i < intervals.length; i++)
    for (let j = i + 1; j < intervals.length; j++) {
      const [a, b] = intervals[i]
      const [c, d] = intervals[j]
      if (Math.max(a, c) < Math.min(b, d)) return false
    }
  return true
}
