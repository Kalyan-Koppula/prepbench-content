function ladderLength(beginWord: string, endWord: string, wordList: string[]): number {
  const dictionary = new Set<string>()
  for (let i = 0; i < wordList.length; i++) {
    dictionary.add(wordList[i])
  }
  if (!dictionary.has(endWord)) {
    return 0
  }
  // BFS over words; neighbours differ in exactly one letter.
  let level: string[] = [beginWord]
  dictionary.delete(beginWord) // removing a word from the set marks it visited
  let words = 1
  while (level.length > 0) {
    const next: string[] = []
    for (let i = 0; i < level.length; i++) {
      const word = level[i]
      // Try every single-letter change: L positions x 26 letters.
      for (let p = 0; p < word.length; p++) {
        for (let code = 97; code <= 122; code++) {
          const candidate = word.substring(0, p) + String.fromCharCode(code) + word.substring(p + 1)
          if (!dictionary.has(candidate)) {
            continue
          }
          if (candidate === endWord) {
            return words + 1
          }
          dictionary.delete(candidate)
          next.push(candidate)
        }
      }
    }
    level = next
    words++
  }
  return 0
}
