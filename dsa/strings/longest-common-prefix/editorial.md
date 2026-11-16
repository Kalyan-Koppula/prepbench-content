**Key insight:** scan column by column. The prefix grows while every string has the same character at position `i`, and stops at the first mismatch or the first string that runs out.

## Approach (vertical scan)

1. For `i = 0, 1, 2, …` take `ch = strs[0][i]`.
2. If `i` reaches the end of any string, or any string has a different character at `i`, return `strs[0].slice(0, i)`.
3. If the first string is exhausted, it is itself the prefix.

## Complexity

- Time `O(S)` where `S` is the total number of characters — in the worst case (all strings equal) every character is compared once. It stops early at the first mismatch.
- Space `O(1)` apart from the returned string.

## Alternatives to mention

- Horizontal scan: start with `strs[0]` and shrink it against each string in turn. Same worst case.
- Sort, then compare only the first and last strings — they differ the most. `O(S log n)` because of the sort; neat one-liner to mention.
- Binary search on the prefix length, or a trie — overkill here, but tries pay off when the same set is queried repeatedly.

## Pitfalls

- An empty string anywhere makes the answer `""`.
- A single string is its own common prefix.
