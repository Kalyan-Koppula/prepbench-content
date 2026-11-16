---
title: Minimum Window Substring
difficulty: Hard
order: 8
lists: [neetcode150, striver]
tags: [sliding-window, hash-map]
leetcode: minimum-window-substring
function: minWindow
params:
  - { name: s, type: string }
  - { name: t, type: string }
returns: string
hints:
  - Grow the window until it covers every character of `t` (with multiplicity), then shrink it from the left while it still does.
  - Keep a single counter of how many required characters are still missing, so checking "does the window cover t?" is O(1).
complexity: { time: "O(m + n)", space: "O(alphabet)" }
---

Given strings `s` and `t`, return the shortest substring of `s` that contains every character of `t`, **including duplicates** (if `t` has two `'a'`s, the substring needs at least two `'a'`s). Matching is case-sensitive.

If several substrings share the minimum length, return the one that starts **leftmost**. If no substring works, return the empty string `""`.

## Constraints

- `1 <= s.length, t.length <= 10^5`
- `s` and `t` contain uppercase and lowercase English letters.

**Follow-up:** can you do it in `O(m + n)` time?
