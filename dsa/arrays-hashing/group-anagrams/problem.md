---
title: Group Anagrams
difficulty: Medium
order: 4
lists: [neetcode150]
tags: [hash-map, canonical-key]
leetcode: group-anagrams
function: groupAnagrams
params:
  - { name: strs, type: "string[]" }
returns: "string[][]"
compare: unordered-nested
hints:
  - Two words belong together when they have the same letters. What single key could every member of a group share?
  - Use the sorted word — or a 26-slot letter count — as a hash map key, and collect words under it.
complexity: { time: "O(n · k)", space: "O(n · k)" }
---

You're given an array of lowercase strings `strs`. Partition it into groups so that two strings share a group exactly when one is a rearrangement of the other's letters.

Return the groups. Neither the order of the groups nor the order of strings inside a group matters. Repeated input strings each appear in the output (they belong to the same group).

## Constraints

- `1 <= strs.length <= 10^4`
- `0 <= strs[i].length <= 100`
- `strs[i]` contains only lowercase English letters.
