function minWindow(s: string, t: string): string {
  const need = new Map<string, number>()
  for (const ch of t) need.set(ch, (need.get(ch) ?? 0) + 1)
  let missing = t.length
  let left = 0
  let bestStart = 0
  let bestLen = Infinity

  for (let right = 0; right < s.length; right++) {
    const ch = s[right]
    if (need.has(ch)) {
      // A positive balance means this copy was still required.
      if (need.get(ch)! > 0) missing--
      need.set(ch, need.get(ch)! - 1)
    }
    while (missing === 0) {
      // Strictly shorter only, so ties keep the earlier (leftmost) window.
      if (right - left + 1 < bestLen) {
        bestLen = right - left + 1
        bestStart = left
      }
      const out = s[left++]
      if (need.has(out)) {
        need.set(out, need.get(out)! + 1)
        if (need.get(out)! > 0) missing++
      }
    }
  }
  return bestLen === Infinity ? '' : s.slice(bestStart, bestStart + bestLen)
}
