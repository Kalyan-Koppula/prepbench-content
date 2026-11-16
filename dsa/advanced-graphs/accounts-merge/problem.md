---
title: Accounts Merge
difficulty: Medium
order: 7
lists: [striver]
tags: [union-find, dfs, hash-map]
leetcode: accounts-merge
function: accountsMerge
params:
  - { name: accounts, type: "string[][]" }
returns: "string[][]"
compare: unordered
hints:
  - Two accounts belong to the same person if they share an email — and that relation is transitive. What structure merges groups transitively?
  - Union-find over accounts — remember the first account that owned each email, and union any later account listing it with that one.
  - Finally, group emails by their root account and sort each group.
complexity: { time: "O(N · α(N) + N log N)", space: "O(N)" }
---

Each entry `accounts[i]` is `[name, email1, email2, ...]`. Two accounts belong to the same person if they have **any** email in common; this is transitive, so accounts linked through a chain of shared emails all belong to one person. Different people may share a name, but accounts that share an email always have the same name.

Merge the accounts and return one entry per person: `[name, ...emails]` with that person's distinct emails sorted in ascending order (plain character-code order, as JavaScript's default `sort()` gives). The order of the entries themselves does not matter.

## Constraints

- `1 <= accounts.length <= 1000`
- `2 <= accounts[i].length <= 10`
- `1 <= accounts[i][j].length <= 30`
- Names consist of English letters; emails are lowercase letters, digits, `.`, `_` and one `@`.
- An account may list the same email more than once.
