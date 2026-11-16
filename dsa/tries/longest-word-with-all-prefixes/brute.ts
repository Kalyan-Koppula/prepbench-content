function longestCompleteWord(words: string[]): string {
  const set = new Set(words)
  const complete = words.filter((w) => {
    for (let len = 1; len <= w.length; len++) if (!set.has(w.slice(0, len))) return false
    return true
  })
  complete.sort((a, b) => b.length - a.length || (a < b ? -1 : a > b ? 1 : 0))
  return complete[0] ?? ''
}
