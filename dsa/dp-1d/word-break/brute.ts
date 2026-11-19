function wordBreak(s: string, wordDict: string[]): boolean {
  // BFS over start positions: from each reachable index, try every word.
  // O(n * dictionary size * word length).
  const reached = new Array(s.length + 1).fill(false)
  reached[0] = true
  const queue: number[] = [0]
  let head = 0
  while (head < queue.length) {
    const i = queue[head]
    head++
    if (i === s.length) {
      return true
    }
    for (let w = 0; w < wordDict.length; w++) {
      const word = wordDict[w]
      const end = i + word.length
      if (end <= s.length && !reached[end] && s.substring(i, end) === word) {
        reached[end] = true
        queue.push(end)
      }
    }
  }
  return false
}
