function differsByOne(a: string, b: string): boolean {
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      diff++
      if (diff > 1) {
        return false
      }
    }
  }
  return diff === 1
}

function ladderLength(beginWord: string, endWord: string, wordList: string[]): number {
  // BFS where each step compares the word with every dictionary word: O(N^2 * L).
  const used = new Array(wordList.length).fill(false)
  let level: string[] = [beginWord]
  let words = 1
  while (level.length > 0) {
    const next: string[] = []
    for (let i = 0; i < level.length; i++) {
      if (level[i] === endWord) {
        return words
      }
      for (let j = 0; j < wordList.length; j++) {
        if (!used[j] && differsByOne(level[i], wordList[j])) {
          used[j] = true
          next.push(wordList[j])
        }
      }
    }
    level = next
    words++
  }
  return 0
}
