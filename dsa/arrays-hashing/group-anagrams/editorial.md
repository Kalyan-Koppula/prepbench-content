**Key idea:** give every word a **signature** that is identical for all its anagrams, such as its 26 letter counts. Words with the same signature belong to the same group, so a hash map from signature to list of words does the grouping in one pass.

## Recognising the pattern

"Put items into groups by some equivalence" is the bucketing use of a hash map from the [Arrays & Hashing](/problems/patterns/arrays-hashing) sheet. The work is in choosing a key that two words share **exactly** when they are anagrams. Once you have that key, grouping is just "append the word to its key's list".

## Brute force

Walk the words in order. When you meet a word that isn't in a group yet, start a new group with it, then scan every later word and pull in the ones that are anagrams of it (compare letter counts). Mark pulled words as assigned so they aren't used twice.

It is correct because every word joins the group of the first word it is an anagram of, and "is an anagram of" is an equivalence: if `a ~ b` and `a ~ c`, then `b ~ c`. Time `O(n² · L)` for `n` words of length up to `L`, since each pair may be compared. Space `O(n)` for the flags.

## Better: sorted letters as the key

Sort the letters of each word: `"eat"`, `"tea"` and `"ate"` all become `"aet"`. Use that sorted string as a map key. Time `O(n · L log L)`, space `O(n · L)` for the keys and groups. Easy to write and fast enough here.

## Optimal: letter counts as the key

Sorting does more than needed. Anagrams share their letter **counts**, and counting is linear.

1. Create an empty map from key to list of words.
2. For each word:
   1. Count its letters into an array of 26 numbers.
   2. Turn the counts into a string key, with a separator between numbers: `"1,0,0,...,1"`.
   3. Append the word to the list for that key, creating the list if it doesn't exist.
3. Return the map's lists.

**Why the separator?** Without it, counts `[1, 11]` and `[11, 1]` would both become `"111"`, and two different words would share a group. Joining with commas makes the key unambiguous.

## Walkthrough

`strs = ["eat", "tea", "tan", "ate", "nat", "bat"]` (counts shown only for non-zero letters)

| word | counts | key (shortened) | groups after |
| --- | --- | --- | --- |
| eat | a1 e1 t1 | a1e1t1 | {a1e1t1: [eat]} |
| tea | a1 e1 t1 | a1e1t1 | {a1e1t1: [eat, tea]} |
| tan | a1 n1 t1 | a1n1t1 | + {a1n1t1: [tan]} |
| ate | a1 e1 t1 | a1e1t1 | a1e1t1: [eat, tea, ate] |
| nat | a1 n1 t1 | a1n1t1 | a1n1t1: [tan, nat] |
| bat | a1 b1 t1 | a1b1t1 | + {a1b1t1: [bat]} |

Result: `[["eat","tea","ate"], ["tan","nat"], ["bat"]]`, in any order.

## Complexity

- Brute force: time `O(n² · L)`, space `O(n)` beyond the output.
- Sorted key: time `O(n · L log L)`, space `O(n · L)`.
- Count key: time `O(n · (L + 26))`: counting each word plus building a 26-entry key. Space `O(n · L)` for the groups and keys.

## Edge cases

- The empty string `""`: its counts are all zero, and every empty string lands in one group.
- Repeated words: they share a key, and each copy appears in the output.
- A single word: one group containing it.
- Words of different lengths can never share a key, because their counts sum to different totals.

## Common mistakes

- Joining counts without a separator, so different count arrays produce the same key.
- Using the count **array** itself as a map key. Arrays are compared by reference, so every word would get its own group.
- Using a set of letters as the key, which puts `"aab"` and `"abb"` together.

## In the interview

- Ask whether only lowercase letters appear. If any character is possible, the sorted-string key is the safe default.
- Present the idea as "a canonical form per word", then compare the two keys: sorting is simpler, counting is linear in the word length.
- Likely follow-ups:
  - *Very long words?* The count key wins, since its cost doesn't grow with `log L`.
  - *Unicode?* Sort by code point, or count with a map and build a key from sorted `char:count` pairs.
  - *Return only groups of size at least 2?* Filter the map's lists by length at the end.
