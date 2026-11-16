// Simulate the pattern as an automaton: track the set of pattern positions reachable
// after reading each character of s.
function isMatch(s: string, p: string): boolean {
  const close = (states: Set<number>) => {
    // A '*' may match nothing, so you can step past it for free.
    const out = new Set(states)
    for (let k = 0; k < p.length; k++) if (out.has(k) && p[k] === '*') out.add(k + 1)
    return out
  }
  let states = close(new Set([0]))
  for (const ch of s) {
    const next = new Set<number>()
    for (const k of states) {
      if (k === p.length) continue
      if (p[k] === '*') next.add(k) // '*' consumes ch and stays
      else if (p[k] === '?' || p[k] === ch) next.add(k + 1)
    }
    states = close(next)
  }
  return states.has(p.length)
}
