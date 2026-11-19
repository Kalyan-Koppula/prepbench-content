---
title: Arrays & Hashing
order: 1
summary: Remember what you have already walked past. A map or set turns "search the rest of the array" into an O(1) lookup, and small counters or markers can replace the map when space matters.
---

## The idea

Many array questions boil down to "for this element, is there some *other* element that ...": an earlier equal value, a value that adds up to the target, a word with the same letters. The brute force answers each question by scanning the array again, so `n` elements times `n` scans gives `O(n²)`.

Hashing removes the second scan. You walk the array once, and as you go you **write down** what you have seen in a `Set` or a `Map`. When you reach a new element, you don't search for its partner: you **ask** the structure, and the answer comes back in `O(1)` on average.

```
           already walked past             current     not seen yet
index:    0     1     2     3       |        4       |   5     6
value:    7     2     9     4       |        5       |   1     8
          └──── facts kept in a map ┘     ask the map
```

Everything left of the current position has been summarised; nothing to the right has been touched. Each step is one lookup and one write.

The facts you store depend on the question:

| Question you keep asking | What to store |
| --- | --- |
| Have I seen this value before? | the value, in a `Set` |
| Where did I see it? | value → index, in a `Map` |
| How many times have I seen it? | value → count, in a `Map` or a count array |
| Which group does it belong to? | canonical key → list of members |
| What sums have the prefixes reached? | prefix sum → count or first index |

The trade is memory for time: up to `O(n)` extra space buys a single pass. Say it out loud in an interview. Follow-ups often ask you to give the memory back, so this folder also covers the tricks for that: a vote counter instead of a count map, the matrix's first row as flags, three pointers instead of a counting pass.

## When to reach for it

Signals in the statement:

- The input is **unsorted** and you need a pair, a duplicate, or a match between elements.
- The obvious solution compares every pair, and the constraints (`n` up to `10^5`) rule out `O(n²)`.
- Words like "frequency", "most common", "appears more than", "distinct", "group together", "same letters".
- A sum over a **contiguous** range where the values can be negative (prefix sums plus a map).

Look-alikes that need a different pattern:

| Statement says | Why hashing is the wrong fit | Use instead |
| --- | --- | --- |
| Pair or triple with a target sum, array **sorted** | The order already tells you which way to move; you can do it in `O(1)` space | [Two Pointers](/problems/patterns/two-pointers) |
| Longest or shortest range under a sum or distinct-count limit, values non-negative | A window shrinks and grows monotonically, so you need no map of sums | [Sliding Window](/problems/patterns/sliding-window) |
| The k largest items of a stream that keeps growing | Counts are fine, but picking the top k repeatedly needs ordering | [Heap](/problems/patterns/heap) |
| The next larger element to the right of each item | The relation depends on position and order, not on value identity | [Stack](/problems/patterns/stack) |

## How it works

The invariant for every one-pass hashing solution is the same:

> Just before you process index `i`, the structure holds exactly the facts about `nums[0..i-1]`.

**Why it is correct.** Any pair of positions `j < i` is examined exactly once: when the scan stands on the later position `i` and asks about everything before it. No pair is missed and none is counted twice.

**Why it is fast.** A `Map` or `Set` is a hash table: `has`, `get` and `set` jump straight to the key's slot, `O(1)` on average, so the scan is `O(n)`.

Here is the invariant at work on a harder case, counting subarrays that sum to `k = 2` in `nums = [2, -1, 3, -2, 1]`. Let `prefix` be the running sum after index `i`. The sum of `nums[j+1..i]` equals `prefix_i - prefix_j`, so a subarray ending at `i` sums to `k` exactly when some earlier prefix equals `prefix - k`. The map counts the prefixes seen so far, starting with the empty prefix `0`.

| i | value | prefix | look up `prefix - k` | matches | total | map after the step |
| --- | --- | --- | --- | --- | --- | --- |
| – | – | 0 | – | – | 0 | {0:1} |
| 0 | 2 | 2 | 0 | 1 | 1 | {0:1, 2:1} |
| 1 | -1 | 1 | -1 | 0 | 1 | {0:1, 2:1, 1:1} |
| 2 | 3 | 4 | 2 | 1 | 2 | {0:1, 2:1, 1:1, 4:1} |
| 3 | -2 | 2 | 0 | 1 | 3 | {0:1, 2:2, 1:1, 4:1} |
| 4 | 1 | 3 | 1 | 1 | 4 | {0:1, 2:2, 1:1, 4:1, 3:1} |

The four subarrays are `[2]`, `[-1, 3]`, `[2, -1, 3, -2]` and `[3, -2, 1]`. Each was found at its last index by a lookup into strictly earlier prefixes: the lookup happens **before** the current prefix is added.

## Templates

### Seen-before lookup

```ts
function findPair(nums: number[], target: number): number[] {
  const indexOf = new Map<number, number>() // value -> index where it appeared
  for (let i = 0; i < nums.length; i++) {
    const partner = indexOf.get(target - nums[i])
    if (partner !== undefined) {
      return [partner, i]
    }
    // Store after the check, so an element cannot pair with itself.
    indexOf.set(nums[i], i)
  }
  return []
}
```

- Check, then store. Reversing the two lines breaks `target = 2 * nums[i]`: the element finds itself.
- Compare the result of `get` with `undefined`, not with a truthy test: index `0` is falsy.
- With a `Set` and the question "seen `nums[i]` already?", the same loop is Contains Duplicate.

### Count, then query

```ts
function countValues(nums: number[]): Map<number, number> {
  const count = new Map<number, number>()
  for (let i = 0; i < nums.length; i++) {
    const current = count.get(nums[i])
    count.set(nums[i], current === undefined ? 1 : current + 1)
  }
  return count
}

function countLetters(s: string): number[] {
  const count = new Array(26).fill(0)
  for (let i = 0; i < s.length; i++) {
    count[s.charCodeAt(i) - 97]++
  }
  return count
}
```

- A missing key reads as `undefined`, so `count.get(x) + 1` is `NaN`. Handle the first sighting explicitly.
- For lowercase letters or digits, the fixed array is faster than a map and counts as `O(1)` space.

### Group by canonical key

```ts
function groupWords(words: string[]): string[][] {
  const groups = new Map<string, string[]>()
  for (const word of words) {
    const key = letterSignature(word)
    let bucket = groups.get(key)
    if (bucket === undefined) {
      bucket = []
      groups.set(key, bucket)
    }
    bucket.push(word)
  }
  const result: string[][] = []
  for (const bucket of groups.values()) {
    result.push(bucket)
  }
  return result
}

function letterSignature(word: string): string {
  const count = countLetters(word)
  // The separator keeps counts like [1, 11] and [11, 1] from colliding.
  return count.join('#')
}
```

- The key must be **equal for every member** of a group and **different across groups**.
- Map keys compare arrays by reference, so two identical count arrays are two different keys. Turn the key into a string first.

### Prefix sum plus map

```ts
function countSubarraysWithSum(nums: number[], k: number): number {
  const prefixCount = new Map<number, number>() // prefix sum -> times seen
  prefixCount.set(0, 1) // the empty prefix, so subarrays starting at 0 count
  let prefix = 0
  let total = 0
  for (let i = 0; i < nums.length; i++) {
    prefix += nums[i]
    const matches = prefixCount.get(prefix - k)
    if (matches !== undefined) {
      total += matches
    }
    const current = prefixCount.get(prefix)
    prefixCount.set(prefix, current === undefined ? 1 : current + 1)
  }
  return total
}
```

- For "longest" instead of "how many", store prefix → **first** index, seed it with `0 → -1`, and never overwrite an existing entry. The earliest start gives the longest range.

### Choosing a template

- A pair, a duplicate or a complement: **seen-before lookup**.
- "Most frequent", "appears more than", "same letters": **count, then query**.
- "Group", "bucket", "which ones are equivalent": **group by canonical key**.
- A contiguous range with a sum condition and negative values allowed: **prefix sum plus map**.

## Choosing the structure

| You need | Structure | Cost per operation | Space |
| --- | --- | --- | --- |
| Membership only | `Set` | `O(1)` average | `O(distinct)` |
| Value → position or count | `Map` | `O(1)` average | `O(distinct)` |
| Counts over a small fixed alphabet | `new Array(26).fill(0)` | `O(1)` | `O(1)` |
| Group key from letters | sorted word, or 26 counts joined with `#` | `O(k log k)` or `O(k)` per word | `O(k)` per key |
| Several sets at once (rows, columns, boxes) | an array of `Set`s, or a 2-D boolean grid | `O(1)` | one per unit |

Prefer a plain array whenever keys are small non-negative integers. Otherwise prefer `Map` over a plain object: objects turn every key into a string, so `1` and `"1"` collide.

## Worked problems

**Two Sum.** The seen-before template in its purest form. The map stores value → index for everything to the left. At each element, look up `target - nums[i]`. The twist is the order of the two operations: look up first, store second, or a value that is exactly half the target pairs with itself.

**Group Anagrams.** The grouping template. Two words are anagrams exactly when their letter counts match, so the 26 counts joined into a string make a key every member of a group shares. The twist is the key itself: sorting each word also works but costs `O(k log k)` per word.

**Longest Consecutive Sequence.** Sorting solves it in `O(n log n)`, but the problem wants `O(n)`. Put every value in a `Set`. A value `x` can only begin a run if `x - 1` is absent, so start counting upward only from those values. The twist is the complexity argument: each value is touched once as a candidate and at most once more while a run walks over it, so the nested loop is still linear.

**Subarray Sum Equals K.** Negative values mean a sliding window cannot decide when to shrink. Instead, keep a map of how many times each prefix sum has occurred, and at each index add the count of `prefix - k`. The twist is the seed entry `0 → 1`, which stands for the empty prefix and lets subarrays that start at index `0` be counted.

## Variations and tricks

- **Bucket by frequency.** For Top K Frequent Elements, counts can never exceed `n`. Make `n + 1` lists where slot `f` holds values seen `f` times, then walk from the top until you have `k` values: `O(n)`, no sort, no heap.
- **One array, count up and down.** For Valid Anagram, add one for each letter of `s` and subtract one for each letter of `t`. The strings match exactly when every slot ends at zero.
- **Many sets indexed by position.** Valid Sudoku keeps 9 row sets, 9 column sets and 9 box sets. The box of cell `(r, c)` is `Math.floor(r / 3) * 3 + Math.floor(c / 3)`.
- **Prefix and suffix passes.** Product of Array Except Self has no division allowed. The answer at `i` is (product of everything left of `i`) times (product of everything right of `i`). Fill the output with left products, then sweep from the right with a running product. The output doubles as prefix storage, so extra space is `O(1)`.
- **Voting instead of counting.** For Majority Element, keep one candidate and a counter. A matching value adds one, a different value subtracts one, and a zero counter means "adopt the current value". Each non-majority value cancels at most one majority value, so the majority survives. For "more than `n / 3`", keep two candidates and two counters, then **verify** both with a second counting pass, since the survivors may not qualify.
- **Three regions with three pointers.** Sort Colors keeps `0`s in `[0, low)`, `1`s in `[low, mid)`, unknowns in `[mid, high]`, and `2`s after `high`. A `0` at `mid` swaps to `low` and both advance, a `1` just advances `mid`, a `2` swaps to `high` and only `high` moves, because the value that came back is still unknown.
- **Pivot, swap, reverse.** Next Permutation scans from the right for the first `i` with `nums[i] < nums[i + 1]`. The suffix after `i` is non-increasing, so it is already its largest arrangement. Swap `nums[i]` with the rightmost suffix value larger than it, then reverse the suffix to make it as small as possible. If no `i` exists, reverse the whole array.
- **The input as its own hash table.** Set Matrix Zeroes records "this row needs clearing" in the row's first cell and "this column needs clearing" in the column's first cell. Because the first row and column are then holding flags, remember in two booleans whether they had zeros of their own, clear the inner cells first, and clear the first row and column last.

## Complexity

- **One pass with a map or set:** `O(n)` average time, `O(n)` space when every value is distinct. Hash tables can degrade on adversarial keys, but the average case is accepted for built-in maps.
- **String keys:** hashing costs the key's length. Grouping `n` words of length `k` is `O(n · k)` with count signatures, `O(n · k log k)` with sorted keys.
- **Fixed alphabets:** a 26-slot or 9-slot array is `O(1)` space.
- **Voting, three pointers, pivot-swap-reverse, in-place markers:** `O(n)` (or `O(m · n)`) time with `O(1)` extra space, the answers to "can you do it without the map?".

## Pitfalls

- Storing the current element before looking up its partner, so it pairs with itself.
- Testing a lookup with `if (map.get(x))`. An index of `0` or a count of `0` reads as false. Compare with `undefined` or call `has`.
- Forgetting the empty prefix: `0 → 1` for counting subarrays, `0 → -1` for the longest one.
- Overwriting a prefix's first index when you want the longest range. Only set it if it is absent.
- Using an array as a `Map` key, or joining counts without a separator, so keys fail to match or collide.
- In Longest Consecutive Sequence, counting upward from every value instead of only from run starts, which is `O(n²)` on a long run.
- In Majority Element II, returning the two candidates without the verification pass.
- In Sort Colors, advancing `mid` after swapping with `high`.
- In Set Matrix Zeroes, clearing the first row or column before the inner cells have read their flags.

## Practice ladder

1. [Two Sum](/problems/two-sum): the seen-before lookup, and why you check before you store.
2. [Contains Duplicate](/problems/contains-duplicate): the same loop with a `Set` and an early exit.
3. [Valid Anagram](/problems/valid-anagram): a 26-slot count array, counting up for one string and down for the other.
4. [Group Anagrams](/problems/group-anagrams): designing a canonical key that every group member shares.
5. [Top K Frequent Elements](/problems/top-k-frequent-elements): count first, then bucket by frequency to avoid sorting.
6. [Product of Array Except Self](/problems/product-of-array-except-self): prefix and suffix passes, with the output as storage.
7. [Valid Sudoku](/problems/valid-sudoku): many sets at once, and computing which box a cell belongs to.
8. [Longest Consecutive Sequence](/problems/longest-consecutive-sequence): set membership plus "start only where a run begins" for linear time.
9. [Majority Element](/problems/majority-element): replacing a count map with one candidate and a vote counter.
10. [Majority Element II](/problems/majority-element-ii): two candidates, and why a verification pass is required.
11. [Sort Colors](/problems/sort-colors): three regions maintained by three pointers in one pass.
12. [Next Permutation](/problems/next-permutation): reading structure from the right, then pivot, swap and reverse in place.
13. [Set Matrix Zeroes](/problems/set-matrix-zeroes): using the matrix's own first row and column as flag storage.
14. [Subarray Sum Equals K](/problems/subarray-sum-equals-k): prefix sums plus a count map, seeded with the empty prefix.
15. [Longest Subarray with Zero Sum](/problems/longest-subarray-with-zero-sum): prefix sums plus a first-index map for the longest range.
