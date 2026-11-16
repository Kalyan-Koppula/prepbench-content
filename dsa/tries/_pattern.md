---
title: Tries
order: 9
summary: A tree keyed by characters — every prefix query costs O(length), not O(number of words).
---

## Recognise it

- Many words, many queries about **prefixes** ("starts with", autocomplete, "every prefix is also a word").
- Searching a grid or stream for **any of many words** at once — share the work on common prefixes.
- Wildcard lookups (`.` matches anything) over a dictionary.
- Bitwise "maximise XOR" over numbers — a trie over bits, highest bit first.

## Template

```ts
class TrieNode {
  children = new Map<string, TrieNode>()
  isEnd = false
}

function insert(root: TrieNode, word: string) {
  let node = root
  for (const ch of word) {
    if (!node.children.has(ch)) node.children.set(ch, new TrieNode())
    node = node.children.get(ch)!
  }
  node.isEnd = true
}

// Returns the node for `prefix`, or null if no word starts with it.
function walk(root: TrieNode, prefix: string): TrieNode | null {
  let node: TrieNode | undefined = root
  for (const ch of prefix) {
    node = node.children.get(ch)
    if (!node) return null
  }
  return node
}
```

## Binary trie (max XOR)

```ts
// children[0] / children[1]; insert bits from 30 down to 0.
for (let b = 30; b >= 0; b--) {
  const bit = (x >> b) & 1
  // to maximise XOR, prefer the child with the *opposite* bit
}
```

## Interview notes

- `Map` children are flexible; a fixed `Array(26)` indexed by `ch.charCodeAt(0) - 97` is faster and what many interviewers expect for lowercase-only input.
- Store extra data on nodes when it saves a pass: the full word at the end node (Word Search II), a count of words passing through (prefix counts), or an index.
- Complexity talk: insert/search are `O(L)`; space is `O(total characters)` in the worst case.
- Trie vs hash set: a set answers exact membership just as fast, but cannot answer "does any word start with this?" without scanning.

## Pitfalls

- Confusing "path exists" with "word ends here" — `search` must check `isEnd`, `startsWith` must not.
- In grid searches, forgetting to un-mark the visited cell when backtracking.
- Returning the same word twice from a grid search — clear `isEnd` (or the stored word) once it's found.
- For XOR tries, use a fixed bit width so all numbers have the same depth.
