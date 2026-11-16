class Trie {
  words: string[] = []

  insert(word: string): void {
    this.words.push(word)
  }

  search(word: string): boolean {
    return this.words.includes(word)
  }

  startsWith(prefix: string): boolean {
    return this.words.some((w) => w.startsWith(prefix))
  }
}
