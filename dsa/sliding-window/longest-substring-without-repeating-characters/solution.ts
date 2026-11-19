function lengthOfLongestSubstring(s: string): number {
  // lastSeen[c] = the most recent index of character code c, or -1 if not seen yet.
  const lastSeen = new Array(128).fill(-1)
  let left = 0
  let best = 0

  for (let right = 0; right < s.length; right++) {
    const code = s.charCodeAt(right)
    // A previous copy only matters if it is still inside the window.
    if (lastSeen[code] >= left) {
      left = lastSeen[code] + 1
    }
    lastSeen[code] = right
    const length = right - left + 1
    if (length > best) {
      best = length
    }
  }
  return best
}
