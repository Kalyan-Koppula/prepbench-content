**Key insight:** put every word in a trie; a word is complete exactly when every node on its path has `isEnd` set — one walk of length `L` checks all its prefixes.

## Approach

1. Insert all words into a trie, marking the end node of each.
2. For each word, walk its path; if any node along the way is not an end node, some prefix is missing.
3. Keep the best candidate: longer wins, and on equal length the lexicographically smaller one wins. Only walk the trie when the word would actually beat the current best.

## Complexity

- Time `O(S)` where `S` is the total length of all words — each word is inserted once and walked at most once.
- Space `O(S)` for the trie.

## Alternatives to mention

- Hash set of all words, then check each prefix with `slice`: `O(Σ L²)` because each prefix is a fresh string. Fine for short words, quadratic for long ones.
- Sort the words, then grow a set of "buildable" words: a word is buildable if `word.slice(0, -1)` is buildable (or the word has length 1). Sorting makes prefixes come first. `O(S log N)`-ish, no trie needed — a good answer if the interviewer doesn't insist on a trie.
- DFS from the root that only descends into `isEnd` children; the deepest node reached (visiting children in alphabetical order) is the answer.

## Pitfalls

- The tie-break is lexicographic among *equal-length* words only; a longer word always wins.
- Single-letter words are complete as long as they appear — they have no other prefixes.
