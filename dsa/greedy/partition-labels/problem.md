---
title: Partition Labels
difficulty: Medium
order: 7
lists: [neetcode150]
tags: [greedy, hash-map, intervals]
leetcode: partition-labels
function: partitionLabels
params:
  - { name: s, type: string }
returns: "number[]"
hints:
  - Once a part contains a letter, it must stretch at least to that letter's last occurrence.
  - "Record each letter's last index. Scan, extending the current part's end to the max last index seen; when the scan reaches that end, close the part."
complexity: { time: "O(n)", space: "O(1)" }
---

Split the string `s` into as many contiguous pieces as possible so that every letter appears in **at most one** piece. Joining the pieces in order must give back `s`.

Return the lengths of the pieces, in order.

## Constraints

- `1 <= s.length <= 500`
- `s` consists of lowercase English letters.
