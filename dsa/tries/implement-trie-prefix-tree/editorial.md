**Key idea:** store each word as a path of characters from a shared root, with a flag on the node where the word ends. `insert` creates missing nodes along the path, `search` follows the path and checks the flag, and `startsWith` only checks that the path exists. Every operation costs the length of its argument.

## Recognising the pattern

"Prefix" in the operations is the signal for the [Tries](/problems/patterns/tries) sheet. A hash set can do exact `search` as fast, but `startsWith` would need a scan of every word, or storing every prefix of every word.

## Brute force

Keep a list of words. `search` compares with each word; `startsWith` checks each word's beginning. That is the reference brute force below. `insert` is `O(1)`, but each query costs `O(total characters stored)`.

## Optimal: a trie with a child array per node

Each node has 26 child slots (one per lowercase letter) and an `isEnd` flag.

1. **`insert(word)`:** start at the root. For each character, create the child if it's missing, then move to it. Mark the last node `isEnd = true`.
2. **`walk(s)`:** start at the root and follow each character; return null as soon as a child is missing, otherwise the final node.
3. **`search(word)`:** `walk(word)` exists **and** has `isEnd`.
4. **`startsWith(prefix)`:** `walk(prefix)` exists.

Sharing `walk` between the two queries makes their one difference obvious: whether the end flag matters.

## Walkthrough

| call | path | result |
| --- | --- | --- |
| insert("apple") | creates a → p → p → l → e, marks e | |
| search("apple") | path exists, e is marked | true |
| search("app") | path exists, second p is not marked | false |
| startsWith("app") | path exists | true |
| insert("app") | path exists, marks second p | |
| search("app") | marked now | true |

## Complexity

- List of words: insert `O(1)`, queries `O(total characters)`.
- Trie: every operation `O(L)` for a string of length `L`. Space `O(total characters × 26)` in the worst case, when no prefixes are shared.

## Edge cases

- Inserting the same word twice: the second insert just re-marks the node.
- A word that is a prefix of another (`app` and `apple`): both are stored on one path, distinguished by flags.
- `startsWith` with a full word: true.

## Common mistakes

- `search` returning true just because the path exists.
- Forgetting to mark the end node in `insert`.
- Using `charCodeAt(i)` directly as the index without subtracting 97.

## In the interview

- Draw a small trie with two words that share a prefix; it explains the structure better than words.
- Compare with a hash set: same exact lookup, but no prefix queries.
- Likely follow-ups:
  - *Count words with a given prefix?* Store a counter per node, incremented on every insert along the path.
  - *Delete a word?* Unmark the end node and, with counters, remove nodes that drop to zero.
  - *Autocomplete?* Walk to the prefix node, then DFS its subtree (or store top suggestions per node).
