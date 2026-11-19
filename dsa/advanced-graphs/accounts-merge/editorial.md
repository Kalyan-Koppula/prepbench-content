**Key idea:** accounts that share an email belong to the same person, and that relation chains: A shares with B, B with C, so A, B and C are one person. That is connected components, and **union-find** handles it as you scan: the first account to list an email "owns" it, and every later account listing the same email is merged with the owner. Then group the emails by their account's root and sort them.

## Recognising the pattern

"Merge groups that overlap, transitively" is the union-find use case in the [Advanced Graphs](/problems/patterns/advanced-graphs) sheet. The only twist is that the items are strings, so a map from email to account index connects them.

## Brute force

Repeatedly look for two groups that share any email and merge them, until no pair overlaps. That is the reference brute force below. Each pass compares every pair of groups: `O(n² · e)` per pass, and up to `n` passes.

## Union-find over accounts

1. `parent[i] = i` for each account.
2. For each account `i` and each of its emails: if the email has no owner yet, set `owner[email] = i`; otherwise union `i` with `owner[email]`.
3. For each email, find the root of its owner and add the email to that root's group.
4. For each group: sort the emails and output `[name of the root account, ...emails]`.

Each email is stored once, so duplicates within and across accounts disappear automatically.

## Walkthrough

```
A1: John  a@x  b@x
A2: John  c@x
A3: John  b@x  d@x
A4: Mary  m@x
```

| step | effect |
| --- | --- |
| A1 | owns a@x, b@x |
| A2 | owns c@x |
| A3 | b@x already owned by A1 → union A3 with A1; owns d@x |
| A4 | owns m@x |

Groups: `{a, b, d}` under A1's root, `{c}` under A2, `{m}` under A4. Output: `[John, a@x, b@x, d@x]`, `[John, c@x]`, `[Mary, m@x]`. The two Johns stay separate because they share no email.

## Complexity

- Repeated merging: `O(n² · e)` per pass, several passes.
- Union-find: time `O(E α(n) + E log E)` for `E` emails, the sort dominating. Space `O(E)`.

## Edge cases

- Same name, no shared email: different people.
- An account repeating its own email: stored once.
- One account: returned with its emails sorted.

## Common mistakes

- Merging by name.
- Forgetting the transitive case and merging only directly overlapping pairs once.
- Not deduplicating emails.

## In the interview

- Explain why it's a components problem and why union-find suits processing as you go.
- Mention the graph alternative: emails as nodes, edges between emails of the same account, DFS per component.
- Likely follow-ups:
  - *Accounts arrive over time?* Union-find supports incremental merging naturally.
  - *Very many emails?* Index emails as integers first to make union-find array-based.
