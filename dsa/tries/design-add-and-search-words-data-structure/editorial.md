**Key idea:** store the words in a trie. A normal letter in the pattern follows exactly one child; a `.` tries every child that exists. The search only ever explores paths that real words take, so wildcards stay cheap.

## Recognising the pattern

Matching patterns against a dictionary, character by character, is a trie search from the [Tries](/problems/patterns/tries) sheet with **backtracking** at the wildcard positions. Without a trie, every search compares the pattern with every stored word.

## Brute force

Keep a list of words. For a search, compare the pattern with every word of the same length, position by position, letting `.` match anything. That is the reference brute force below. `O(words × length)` per search.

## Optimal: trie with recursive matching

`addWord` is a normal trie insert.

`matches(node, pattern, i)` answers "does some stored word, continuing from `node`, match `pattern[i..]`?":

1. If `i == pattern.length`, return `node.isEnd`. The pattern must match a whole word, not a prefix.
2. If `pattern[i]` is `.`, return `true` if `matches(child, pattern, i + 1)` holds for any existing child.
3. Otherwise follow the child for `pattern[i]`; if it doesn't exist, return `false`.

`search(pattern)` is `matches(root, pattern, 0)`.

## Walkthrough

Words: `bad`, `dad`, `mad`.

| search | path | result |
| --- | --- | --- |
| "pad" | no child `p` at the root | false |
| "bad" | b → a → d, end marked | true |
| ".ad" | try b → a → d: end marked | true (stops at the first match) |
| "b.." | b, then any child (a), then any child (d), end marked | true |
| "b." | b → a, then the pattern ends at a node that isn't a word end | false |

## Complexity

- List: `addWord` `O(1)`; `search` `O(words × length)`.
- Trie: `addWord` `O(L)`. `search` is `O(L)` without dots. With `d` dots it can branch up to `26^d` times, but only along paths that exist, so in practice it is far less. Space `O(total characters × 26)`.

## Edge cases

- A pattern of only dots: matches any word of that length.
- A pattern longer than every word: the path runs out.
- A pattern matching a prefix of a longer word only: rejected by the `isEnd` check.

## Common mistakes

- Returning `true` when the pattern ends on a node that isn't a word end.
- Exploring all 26 letters at a dot instead of only existing children.
- Treating `.` as "zero or more characters". It matches exactly one.

## In the interview

- Explain that the trie limits the wildcard branching to real words.
- Likely follow-ups:
  - *Many dots expected?* Group words by length first, or keep tries per length, to prune early.
  - *`*` matching any sequence?* A harder matcher: DP or a combined trie and backtracking search (related to Wildcard Matching).
