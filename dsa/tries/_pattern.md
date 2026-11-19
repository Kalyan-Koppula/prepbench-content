---
title: Tries
order: 9
summary: A tree of characters where every word is a path from the root — prefix questions cost the length of the prefix, not the size of the dictionary.
---

## The idea

A trie (pronounced "try", from re**trie**val) stores a set of strings as paths in a tree. Each edge is a character, and each node represents the prefix spelled by the path from the root to it. Words that share a prefix share the nodes for it.

Here is a trie holding `car`, `cart`, `cat` and `dog` (`*` marks a node where a word ends):

```
            (root)
            /    \
           c      d
           |      |
           a      o
          / \     |
         r*  t*   g*
         |
         t*
```

Three things follow from this shape:

1. **Lookups depend only on the length of the query.** Checking whether `cart` is stored means following `c → a → r → t`, four steps, whether the trie holds ten words or ten million.
2. **Prefixes are free.** The node at the end of `ca` is the root of everything that starts with `ca`. "Does any word start with this?" is "does the path exist?".
3. **A word needs an explicit end marker.** `car` is a word here, but `ca` isn't, even though its node exists. The node needs a flag (or the word itself) to say a word ends there.

A hash set can answer "is this exact word stored?" just as fast. A trie earns its place when the question is about **prefixes**, or when you search letter by letter and want to stop as soon as no stored word can match.

## When to reach for it

- "Starts with", "prefix", "autocomplete", "all words beginning with".
- Many words searched in a grid or a stream at once: build one trie and search everything together, instead of one search per word.
- Wildcard matching against a dictionary (`.` matches any letter): branch at the wildcard, but only into children that exist.
- Binary representations of numbers: a **bit trie** answers "which stored number maximises XOR with `x`?" one bit at a time.

Look-alikes:

| Statement says | What to use instead |
| --- | --- |
| Exact membership only | A hash set ([Arrays & Hashing](/problems/patterns/arrays-hashing)) |
| Sorted order of words, ranges of strings | Sorting, or a BST ([Binary Search Trees](/problems/patterns/bst)) |
| Pattern search inside one long text | String algorithms such as KMP ([Strings](/problems/patterns/strings)) |
| Word Search with a single word | Plain backtracking ([Backtracking](/problems/patterns/backtracking)) |

## How it works

Inserting `cart` into a trie that already holds `car`:

| step | character | node exists? | action |
| --- | --- | --- | --- |
| 1 | c | yes | follow it |
| 2 | a | yes | follow it |
| 3 | r | yes | follow it |
| 4 | t | no | create it, follow it |
| end | – | – | mark the node as the end of a word |

Searching walks the same path without creating anything. If an edge is missing, the word (and every word with that prefix) isn't stored. If the path completes, the answer depends on the end marker for `search`, and is simply "yes" for `startsWith`.

The **invariant**: the node reached after reading a prefix `p` represents exactly the stored words that start with `p`. Everything in its subtree shares that prefix, and nothing outside it does.

## Templates

### Node and basic operations

```ts
class TrieNode {
  children: Array<TrieNode | null>
  isEnd: boolean

  constructor() {
    this.children = new Array(26).fill(null) // one slot per lowercase letter
    this.isEnd = false
  }
}

function insert(root: TrieNode, word: string): void {
  let node = root
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

// The node at the end of `prefix`, or null if the path breaks off.
function walk(root: TrieNode, prefix: string): TrieNode | null {
  let node: TrieNode | null = root
  for (let i = 0; i < prefix.length && node !== null; i++) {
    node = node.children[prefix.charCodeAt(i) - 97]
  }
  return node
}
// search(word):     walk(root, word) !== null && walk(root, word).isEnd
// startsWith(pre):  walk(root, pre) !== null
```

- An array of 26 children is fast and simple for lowercase letters. For larger alphabets, use a map from character to child.
- `walk` serves both `search` and `startsWith`; only the final check differs.

### Searching with a wildcard

```ts
function matches(node: TrieNode, pattern: string, i: number): boolean {
  if (i === pattern.length) {
    return node.isEnd
  }
  if (pattern[i] === '.') {
    for (let c = 0; c < 26; c++) {
      const child = node.children[c]
      if (child !== null && matches(child, pattern, i + 1)) {
        return true
      }
    }
    return false
  }
  const child = node.children[pattern.charCodeAt(i) - 97]
  return child !== null && matches(child, pattern, i + 1)
}
```

- A wildcard branches only into children that exist, so the search stays limited to real words.

### Many words on a grid (trie-guided DFS)

```ts
// Walk the grid and the trie together. Stop as soon as the trie has no child
// for the current letter: no remaining word can continue this path.
function dfs(board: string[][], r: number, c: number, node: TrieNode, found: string[]): void {
  // ... bounds check, look up child for board[r][c], stop if null,
  // record a word if child ends one, mark the cell, recurse to neighbours,
  // unmark the cell
}
```

- Storing the whole word on its end node (instead of a boolean) makes it easy to report.
- Clear the stored word after reporting it so each word is reported once, and remove empty branches to speed up later searches.

### Choosing a template

- Exact words and prefixes: **basic operations**.
- Patterns with `.` against a dictionary: **wildcard search**.
- Many words searched simultaneously in a grid or text: **trie-guided DFS**.
- Numbers and XOR: a **bit trie** with two children per node, from the highest bit down.

## Choosing what to store

| Need | Store at each node |
| --- | --- |
| Is this exact word present? | `isEnd` flag |
| Report the word when found (grids) | The word itself, or null |
| Count words with a prefix | A counter incremented on every insert along the path |
| Autocomplete top suggestions | A small sorted list of best words in the subtree |
| Maximum XOR | Two children (bit 0 and bit 1), no end flag needed |

## Worked problems

**Implement Trie.** The three operations above. The only subtlety is the difference between `search` (the path exists **and** ends a word) and `startsWith` (the path exists).

**Design Add and Search Words.** Insertion is standard. Search recurses: an ordinary letter follows one child, a `.` tries every existing child. Because patterns have at most a couple of dots, the branching stays small.

**Maximum XOR of Two Numbers.** Insert every number as a 31-bit path, highest bit first. For each number, walk the trie greedily choosing the **opposite** bit whenever that child exists, since a 1 in a higher bit outweighs every lower bit. The best walk over all numbers is the answer.

**Word Search II.** Build a trie of all the words, then DFS from every cell, moving through the trie and the grid together. The trie stops a path the moment no word can continue it, which is what makes searching thousands of words at once feasible.

## Variations and tricks

- **Prefix counts.** Keep a `count` per node for "how many words start with this prefix" in `O(length)`.
- **Deleting words.** Decrement counts on the path and remove nodes whose count reaches zero.
- **Pruning during grid search.** After a word is found, clear it; if a node has no children and no word left, remove it from its parent.
- **Compressed tries (radix trees).** Merge chains of single-child nodes into one edge labelled with a string. Saves memory; worth mentioning, rarely coded.
- **Suffix tries.** Insert every suffix of a text to answer "does this pattern occur anywhere?" in `O(pattern length)`.

## Complexity

- Insert, search, startsWith: `O(L)` time for a string of length `L`.
- Space: `O(total characters inserted × alphabet size)` with child arrays, `O(total characters)` with maps.
- Wildcard search: up to `O(26^d · L)` for `d` wildcards, in practice limited by the words that exist.
- Bit trie: `O(n · B)` to build and query, for `B` bits per number.

## Pitfalls

- Forgetting the end marker, so prefixes of words are reported as words.
- Treating `startsWith` and `search` the same.
- Allocating 26 children per node for huge alphabets (use maps), or using maps when 26 slots would be simpler and faster.
- In grid search, not restoring a cell after backtracking, or reporting the same word twice.
- Bit tries built from the lowest bit: greedy choice only works from the highest bit down.

## Practice ladder

1. [Implement Trie (Prefix Tree)](/problems/implement-trie-prefix-tree): the structure and its three operations.
2. [Design Add and Search Words Data Structure](/problems/design-add-and-search-words-data-structure): wildcard search by branching into existing children.
3. [Longest Word With All Prefixes](/problems/longest-word-with-all-prefixes): checking end markers along a path.
4. [Maximum XOR of Two Numbers in an Array](/problems/maximum-xor-of-two-numbers-in-an-array): a bit trie and greedy choice from the top bit.
5. [Word Search II](/problems/word-search-ii): one trie guiding a grid search for many words at once.
