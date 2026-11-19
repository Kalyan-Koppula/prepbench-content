class WordTrieNode {
  children: Array<WordTrieNode | null>
  word: string | null // the word that ends here, until it has been found
  childCount: number

  constructor() {
    this.children = new Array(26).fill(null)
    this.word = null
    this.childCount = 0
  }
}

function search(board: string[][], r: number, c: number, parent: WordTrieNode, found: string[]): void {
  const ch = board[r][c]
  if (ch === '#') {
    return // already on the current path
  }
  const index = ch.charCodeAt(0) - 97
  const node = parent.children[index]
  if (node === null) {
    return // no remaining word continues with this letter
  }
  if (node.word !== null) {
    found.push(node.word)
    node.word = null // report each word once
  }

  board[r][c] = '#' // mark as used
  if (r > 0) {
    search(board, r - 1, c, node, found)
  }
  if (r < board.length - 1) {
    search(board, r + 1, c, node, found)
  }
  if (c > 0) {
    search(board, r, c - 1, node, found)
  }
  if (c < board[0].length - 1) {
    search(board, r, c + 1, node, found)
  }
  board[r][c] = ch // restore

  // Prune: a branch with no words left never needs to be searched again.
  if (node.childCount === 0 && node.word === null) {
    parent.children[index] = null
    parent.childCount--
  }
}

function findWords(board: string[][], words: string[]): string[] {
  const root = new WordTrieNode()
  for (let w = 0; w < words.length; w++) {
    let node = root
    for (let i = 0; i < words[w].length; i++) {
      const c = words[w].charCodeAt(i) - 97
      let child = node.children[c]
      if (child === null) {
        child = new WordTrieNode()
        node.children[c] = child
        node.childCount++
      }
      node = child
    }
    node.word = words[w]
  }

  const found: string[] = []
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[0].length; c++) {
      search(board, r, c, root, found)
    }
  }
  return found
}
