**Key idea:** put every word in a trie. A word is complete exactly when every node on its path is marked as the end of some word, since those nodes are its prefixes. Check that for each word, and keep the longest one, breaking ties by lexicographic order.

## Recognising the pattern

"Every prefix must also be a word" is a question about the nodes along a path, which is what a trie lays out explicitly. It is a natural follow-on from Implement Trie in the [Tries](/problems/patterns/tries) sheet.

## Brute force

Put all words in a hash set. For each word, check each of its prefixes against the set. That is the reference brute force below. Each check creates a new prefix string, so a word of length `L` costs `O(L²)`, and the total is the sum of the squared lengths.

## Optimal: trie and one walk per word

1. Insert every word into a trie, marking word ends.
2. For each word, walk its path. If any node on it isn't marked as a word end, the word is incomplete.
3. Track the best complete word: longer wins, and for equal lengths the lexicographically smaller wins.

Only check a word if it would beat the current best; that skips most of the walks.

**Alternative.** A DFS from the root that only descends into children marked as word ends visits exactly the complete words. Visiting children in alphabetical order and keeping the deepest node found first gives the tie-breaking for free.

## Walkthrough

`words = ["a", "ap", "app", "appl", "apply", "apple", "b"]`

| word | prefixes all marked? | candidate |
| --- | --- | --- |
| a | a | a |
| ap | a, ap | ap |
| app | a, ap, app | app |
| appl | yes | appl |
| apply | yes | apply |
| apple | yes, same length as apply and smaller | apple |
| b | yes, shorter | apple |

Answer `"apple"`.

## Complexity

- Set of prefixes: time `O(Σ L²)`, space `O(S)` for the set.
- Trie: time `O(S)`, where `S` is the total length, to build and check. Space `O(S × 26)` in the worst case.

## Edge cases

- No complete word (no single-letter words at all): return `""`.
- Duplicate words: harmless; the trie marks the same node twice.
- Ties: lexicographic comparison picks the smaller word.

## Common mistakes

- Checking only that the word itself exists.
- Building prefixes with `substring` inside a loop and then claiming linear time.
- Breaking ties by input order instead of lexicographic order.

## In the interview

- Mention the set solution, then the trie, which checks all prefixes in one walk.
- Likely follow-ups:
  - *Words built one character at a time from other words (Longest Word in Dictionary)?* The same problem, often solved with the same trie or by sorting.
  - *Return all complete words?* The DFS that only follows marked nodes lists them.
