**Key insight:** give every word a canonical key that anagrams share — its sorted letters, or its letter counts — and bucket words by that key in a hash map.

## Approach

1. For each word, build a key. The count-based key is `O(k)`: tally the 26 letters and join the counts with a separator (`"1#0#2#…"`) so `[1, 11]` and `[11, 1]` can't collide.
2. Append the word to `groups.get(key)` (creating the bucket if needed).
3. Return the map's values.

## Complexity

- Time `O(n · k)` with count keys, where `k` is the max word length (`O(n · k log k)` with sorted keys).
- Space `O(n · k)` — every word is stored once, plus its key.

## Alternatives to mention

- Sorted-string key: `word.split('').sort().join('')`. Slightly slower asymptotically but the most common interview answer; say which you're using and why.
- Brute force: compare each word against a representative of every existing group — `O(n² · k)`.

## Pitfalls

- Joining counts without a separator creates ambiguous keys.
- The empty string is a valid word; it gets its own (all-zero) key.
