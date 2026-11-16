// BFS over start positions: from each reachable index, try every dictionary word.
function wordBreak(s: string, wordDict: string[]): boolean {
  const seen = new Set<number>([0])
  const queue = [0]
  while (queue.length) {
    const i = queue.shift()!
    if (i === s.length) return true
    for (const w of wordDict) {
      if (s.startsWith(w, i) && !seen.has(i + w.length)) {
        seen.add(i + w.length)
        queue.push(i + w.length)
      }
    }
  }
  return false
}
