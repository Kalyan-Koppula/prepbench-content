class Trie {
  // A plain list of words: insert O(1), queries O(total length of all words).
  words: string[]

  constructor() {
    this.words = []
  }

  insert(word: string): void {
    this.words.push(word)
  }

  search(word: string): boolean {
    for (let i = 0; i < this.words.length; i++) {
      if (this.words[i] === word) {
        return true
      }
    }
    return false
  }

  startsWith(prefix: string): boolean {
    for (let i = 0; i < this.words.length; i++) {
      const w = this.words[i]
      if (w.length < prefix.length) {
        continue
      }
      let ok = true
      for (let j = 0; j < prefix.length; j++) {
        if (w[j] !== prefix[j]) {
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
