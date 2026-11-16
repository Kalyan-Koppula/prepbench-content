---
title: Alien Dictionary
difficulty: Hard
order: 10
lists: [neetcode150, striver]
tags: [topological-sort, graph, string]
leetcode: alien-dictionary
function: alienOrder
params:
  - { name: words, type: "string[]" }
returns: string
compare: checker
hints:
  - Only adjacent words tell you anything, and only at their first differing position.
  - Each such position gives an edge `a → b` ("a comes before b"). Topologically sort the letters.
  - Two ways the input can be invalid — a cycle, and a word followed by its own proper prefix.
complexity: { time: "O(C)", space: "O(1)" }
---

An alien language uses a subset of the lowercase English letters, in an unknown order. You're given `words`, a list that is claimed to be sorted lexicographically by the alien alphabet.

Return a string containing every distinct letter that appears in `words`, each exactly once, in an order consistent with the list. If several orders are consistent, any one is accepted. If no order is consistent with the list, return `""`.

Words are compared the usual way: at the first position where they differ, the word with the earlier letter comes first; if one word is a proper prefix of the other, the shorter word comes first.

## Constraints

- `1 <= words.length <= 100`
- `1 <= words[i].length <= 100`
- `words[i]` consists of lowercase English letters.
