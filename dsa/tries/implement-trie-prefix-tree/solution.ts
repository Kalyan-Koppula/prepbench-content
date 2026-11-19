class TrieNode {
  children: Array<TrieNode | null> // one slot per lowercase letter
  isEnd: boolean // a word ends exactly here

  constructor() {
    this.children = new Array(26).fill(null)
    this.isEnd = false
  }
}

class Trie {
  root: TrieNode

  constructor() {
    this.root = new TrieNode()
  }

  insert(word: string): void {
    let node = this.root
    for (let i = 0; i < word.length; i++) {
      const c = word.charCodeAt(i) - 97
      let child = node.children[c]
      if (child === null) {
        child = new TrieNode()
        node.children[c] = child
      }
      node = child
    }
    node.isEnd = true
  }

  // The node at the end of `s`, or null if the path breaks off.
  walk(s: string): TrieNode | null {
    let node: TrieNode | null = this.root
    for (let i = 0; i < s.length && node !== null; i++) {
      node = node.children[s.charCodeAt(i) - 97]
    }
    return node
  }

  search(word: string): boolean {
    const node = this.walk(word)
    return node !== null && node.isEnd
  }

  startsWith(prefix: string): boolean {
    return this.walk(prefix) !== null
  }
}
