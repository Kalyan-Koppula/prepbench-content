function minWindow(s: string, t: string): string {
  let best = ''
  for (let i = 0; i < s.length; i++) {
    // Extend from i until the window covers t; that's the shortest window starting at i.
    const need = new Map<string, number>()
    for (const ch of t) need.set(ch, (need.get(ch) ?? 0) + 1)
    let missing = t.length
    for (let j = i; j < s.length; j++) {
      const c = need.get(s[j])
      if (c !== undefined) {
        if (c > 0) missing--
        need.set(s[j], c - 1)
      }
      if (missing === 0) {
        if (best === '' || j - i + 1 < best.length) best = s.slice(i, j + 1)
        break
      }
    }
  }
  return best
}
