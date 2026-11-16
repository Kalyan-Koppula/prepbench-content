**Key insight:** accounts are nodes and a shared email is an edge; each connected component is one person. Union-find builds the components in one pass over the emails.

## Approach

1. `owner = Map<email, accountIndex>`. For each account `i` and each of its emails: if the email already has an owner, `union(i, owner)`; otherwise record `owner[email] = i`.
2. Group emails by `find(owner[email])` — a `Map<root, string[]>`. Every email appears exactly once in `owner`, so duplicates disappear automatically.
3. For each group, sort the emails and prepend the root account's name.

## Complexity

With `N` total emails across all accounts:

- Time `O(N · α(N) + N log N)` — near-constant unions, then sorting.
- Space `O(N)` — the maps.

## Alternatives to mention

- **DFS on an email graph:** connect each account's first email to its others, then DFS from each unvisited email to collect a component. Same complexity, more code for the adjacency lists.
- Repeatedly merging any two accounts that overlap until nothing changes: `O(A² · L)` per round — too slow at scale, but a fine starting point to mention.

## Pitfalls

- Grouping by **name** is wrong: two different people can share a name.
- Sorting must be by character code (`'.'` < `'@'` < letters), which is what `sort()` with no comparator does.
- A repeated email inside one account must appear once in the output.
