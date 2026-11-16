class WordDictionary {
  words: string[] = []

  addWord(word: string): void {
    this.words.push(word)
  }

  search(pattern: string): boolean {
    return this.words.some((w) => w.length === pattern.length && [...pattern].every((ch, i) => ch === '.' || ch === w[i]))
  }
}
