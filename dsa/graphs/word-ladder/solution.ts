function ladderLength(beginWord: string, endWord: string, wordList: string[]): number {
  if (!wordList.includes(endWord)) return 0
  const L = beginWord.length
  const patterns = (w: string) => Array.from({ length: L }, (_, i) => w.slice(0, i) + '*' + w.slice(i + 1))

  const buckets = new Map<string, string[]>()
  for (const w of wordList) {
    for (const p of patterns(w)) {
      if (!buckets.has(p)) buckets.set(p, [])
      buckets.get(p)!.push(w)
    }
  }

  const visited = new Set([beginWord])
  let frontier = [beginWord]
  let steps = 1
  while (frontier.length) {
    const next: string[] = []
    for (const word of frontier) {
      for (const p of patterns(word)) {
        for (const nb of buckets.get(p) ?? []) {
          if (nb === endWord) return steps + 1
          if (visited.has(nb)) continue
          visited.add(nb)
          next.push(nb)
        }
        buckets.delete(p) // all of its words are now visited
      }
    }
    frontier = next
    steps++
  }
  return 0
}
