function minWindow(s: string, t: string): string {
  const target = new Array(128).fill(0)
  for (let i = 0; i < t.length; i++) {
    target[t.charCodeAt(i)]++
  }
  let best = ''
  for (let start = 0; start < s.length; start++) {
    // Extend from start until the window covers t: that is the shortest
    // window beginning at start.
    const need = target.slice()
    let missing = t.length
    for (let end = start; end < s.length; end++) {
      const code = s.charCodeAt(end)
      if (need[code] > 0) {
        missing--
      }
      need[code]--
      if (missing === 0) {
        if (best === '' || end - start + 1 < best.length) {
          best = s.substring(start, end + 1)
        }
        break
      }
    }
  }
  return best
}
