class WordDictionary {
  // Compare the pattern with every stored word: O(words * length) per search.
  words: string[]

  constructor() {
    this.words = []
  }

  addWord(word: string): void {
    this.words.push(word)
  }

  search(pattern: string): boolean {
    for (let i = 0; i < this.words.length; i++) {
      const w = this.words[i]
      if (w.length !== pattern.length) {
        continue
      }
      let ok = true
      for (let j = 0; j < w.length; j++) {
        if (pattern[j] !== '.' && pattern[j] !== w[j]) {
          ok = false
          break
        }
      }
      if (ok) {
        return true
      }
    }
    return false
  }
}
