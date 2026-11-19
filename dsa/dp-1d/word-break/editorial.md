**Key idea:** let `ok[i]` mean "the first `i` characters can be split into dictionary words". Then `ok[i]` is true when some earlier split point `j` has `ok[j]` true and the piece `s[j..i)` is a word. Fill `ok` from left to right; the answer is `ok[n]`.

## Recognising the pattern

Splitting a string into valid pieces, where only the boundary positions matter, is a prefix DP from the [1-D Dynamic Programming](/problems/patterns/dp-1d) sheet. Plain backtracking re-explores the same suffix many times; the table remembers which prefixes work.

## Alternative: BFS over positions (shown below)

From each reachable position, try every dictionary word that fits next, and mark the position after it as reachable. If position `n` is reached, the string can be split. That is the reference brute force below. `O(n × dictionary × word length)`, fine when the dictionary is small.

## Prefix DP

1. Put the words in a set and note the longest word length `L`.
2. `ok[0] = true`.
3. For each `i` from 1 to `n`: for each `j` from `i − 1` down to `max(0, i − L)`: if `ok[j]` and `s[j..i)` is a word, set `ok[i] = true` and stop.
4. Return `ok[n]`.

Limiting `j` to the last `L` positions avoids checking pieces longer than any word.

## Walkthrough

`s = "leetcode"`, `wordDict = ["leet", "code"]`

| i | prefix | split found | ok[i] |
| --- | --- | --- | --- |
| 0 | "" | – | true |
| 1–3 | l, le, lee | none | false |
| 4 | leet | ok[0] and "leet" | true |
| 5–7 | … | none | false |
| 8 | leetcode | ok[4] and "code" | true |

Answer `true`.

## Complexity

- Backtracking without memo: exponential on inputs like `"aaaa…ab"` with words `a`, `aa`, `aaa`.
- BFS over positions: `O(n × W × L)` for `W` words.
- Prefix DP: `O(n × L × L)`: `n` positions, up to `L` split points each, and building and hashing a substring of length up to `L`. Space `O(n)`.

## Edge cases

- The whole string is one word: `ok[n]` via `j = 0`.
- Repeated use of one word, like `"aaaa"` with `["a"]`: allowed.
- No valid split: `false`.

## Common mistakes

- Greedily taking the longest matching word first, which fails on `"aaaaaaa"` with `["aaaa", "aaa"]`.
- Forgetting `ok[0] = true`.
- Backtracking without memoisation.

## In the interview

- State the meaning of `ok[i]` precisely, then the recurrence.
- Likely follow-ups:
  - *Return all sentences (Word Break II)?* Backtracking with memoisation of the sentences for each suffix; the output can be exponential.
  - *Large dictionary?* A trie lets you walk forward from `j` and stop when no word continues.
