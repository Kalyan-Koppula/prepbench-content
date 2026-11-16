function ladderLength(beginWord: string, endWord: string, wordList: string[]): number {
  const oneApart = (a: string, b: string) => {
    let diff = 0
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) diff++
    return diff === 1
  }
  const dist = new Map<string, number>([[beginWord, 1]])
  const queue = [beginWord]
  for (let h = 0; h < queue.length; h++) {
    const w = queue[h]
    if (w === endWord) return dist.get(w)!
    for (const v of wordList) {
      if (dist.has(v) || !oneApart(w, v)) continue
      dist.set(v, dist.get(w)! + 1)
      queue.push(v)
    }
  }
  return 0
}
