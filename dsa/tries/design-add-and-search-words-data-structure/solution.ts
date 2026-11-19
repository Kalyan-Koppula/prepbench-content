class WordNode {
  children: Array<WordNode | null>
  isEnd: boolean

  constructor() {
    this.children = new Array(26).fill(null)
    this.isEnd = false
  }
}

class WordDictionary {
  root: WordNode

  constructor() {
    this.root = new WordNode()
  }

  addWord(word: string): void {
    let node = this.root
    for (let i = 0; i < word.length; i++) {
      const c = word.charCodeAt(i) - 97
      let child = node.children[c]
      if (child === null) {
        child = new WordNode()
        node.children[c] = child
      }
      node = child
    }
    node.isEnd = true
  }

  // Does some stored word, continuing from `node`, match pattern[i..]?
  matches(node: WordNode, pattern: string, i: number): boolean {
    if (i === pattern.length) {
      return node.isEnd
    }
    if (pattern[i] === '.') {
      // A wildcard may continue through any child that exists.
      for (let c = 0; c < 26; c++) {
        const child = node.children[c]
        if (child !== null && this.matches(child, pattern, i + 1)) {
          return true
        }
      }
      return false
    }
    const child = node.children[pattern.charCodeAt(i) - 97]
    return child !== null && this.matches(child, pattern, i + 1)
  }

  search(pattern: string): boolean {
    return this.matches(this.root, pattern, 0)
  }
}
