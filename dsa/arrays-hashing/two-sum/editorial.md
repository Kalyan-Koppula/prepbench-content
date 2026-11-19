**Key idea:** for any number `x`, the only partner that works is `target - x`. Scan left to right, remember each value's index in a hash map, and at every step ask the map whether the partner has already gone by.

## Recognising the pattern

You need **two positions** with an exact relationship, and the input isn't sorted. Fix one element and the other is fully determined: it must equal `target - nums[i]`. Searching for one known value is a hash lookup, so this is the "complement lookup" template from the [Arrays & Hashing](/problems/patterns/arrays-hashing) sheet: store what you've seen, look up what you need.

Trying every pair is about 50 million checks for `10^4` elements: it may pass, but it is the answer an interviewer wants you to improve.

## Brute force

Try every pair `(i, j)` with `i < j` and return the first whose values add up to `target`. Starting `j` at `i + 1` checks each pair once and never pairs an element with itself. It is correct because it checks every legal pair. Time `O(n²)`, space `O(1)`.

## Optimal: one pass with a value-to-index map

Look at what the inner loop of the brute force does. For a fixed `i`, it scans the rest of the array searching for one specific value, `target - nums[i]`. That is a membership question, and a scan is the slowest way to answer it.

Turn the search around. Instead of looking **ahead** for a partner, look **behind**: has the partner already appeared? Every pair `(i, j)` with `i < j` is found when the scan reaches `j`, because `nums[i]` has been stored by then. One pass is enough.

The invariant: before processing index `i`, the map holds `value -> index` for every position `0 .. i - 1`.

1. Create an empty map from value to index.
2. For each index `i`:
   1. Compute `partner = target - nums[i]`.
   2. If the map contains `partner`, return `[map.get(partner), i]`.
   3. Otherwise store `nums[i] -> i`.
3. An answer is guaranteed; the final `return []` only satisfies the type checker.

**Why look up before storing?** If `nums[i]` were stored first, then with `target = 2 * nums[i]` the lookup would find `nums[i]` itself and return `[i, i]`. Looking up first means the map only ever holds earlier positions, so the two indices always differ.

If a value repeats, the map keeps the latest index. Any earlier copy is an equally valid partner, so that never matters.

## Walkthrough

`nums = [4, 11, 7, 2, 5]`, `target = 13`.

| i | nums[i] | partner | in map? | map after |
| --- | --- | --- | --- | --- |
| 0 | 4 | 9 | no | {4:0} |
| 1 | 11 | 2 | no | {4:0, 11:1} |
| 2 | 7 | 6 | no | {4:0, 11:1, 7:2} |
| 3 | 2 | 11 | yes, at 1 | return `[1, 3]` |

The pair is discovered at its **second** member, `2`. At index 1 the scan didn't know about the `2` yet, and didn't need to.

## Complexity

- Brute force: time `O(n²)`, every pair is checked once. Space `O(1)`.
- Optimal: time `O(n)`, one pass with an expected `O(1)` map operation per element. Space `O(n)`, the map can hold every value before the pair is found.
- Sort plus two pointers (worth mentioning): time `O(n log n)` for the sort, space `O(n)` to remember original indices.

## Edge cases

- Equal pair, such as `[3, 3]` with `target = 6`: the first `3` is stored, the second finds it.
- `target` is twice a value that appears once: lookup-before-store stops it pairing with itself.
- Negative numbers and zero: the complement works the same, for example `[-3, 4, 3, 90]` with `target = 0`.
- The pair is the last two elements: the loop simply runs to the end.
- Overflow: values and `target` go up to `10^9` in size, so `target - nums[i]` can reach `2 * 10^9`. That is safe in JavaScript, but in Java or C++ compute it in a `long`.

## Common mistakes

- Storing `nums[i]` before looking up the partner, which can return the same index twice.
- Filling the map in a first pass, then searching without checking that the found index differs from `i`.
- Returning the **values** instead of the indices.
- Sorting the array to use two pointers and then returning positions in the sorted array rather than the original one.
- Starting the brute force inner loop at `j = 0`, which tries `(i, i)` and checks every pair twice.

## In the interview

- Clarify: is there always exactly one answer? Can the same element be used twice? Are values or indices wanted? Is the input sorted?
- Give the brute force in one sentence, then: "For each number the partner is fixed, so I keep a map of values I've already seen and look the partner up in constant time." Point out that you look up before inserting, and why.
- Likely follow-ups:
  - *The array is sorted?* Two pointers from both ends: `O(n)` time and `O(1)` space.
  - *Return all pairs, or count them?* Keep a count per value instead of one index, and add the partner's count at each step.
  - *Numbers arrive as a stream with many queries?* Store counts in a map: `add` is `O(1)`, and `find` scans the distinct values.
  - *Three numbers that sum to target?* Sort, fix one element, and run the two-pointer search on the rest: `O(n²)`.
