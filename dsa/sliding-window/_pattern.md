---
title: Sliding Window
order: 3
summary: Grow the right edge, shrink the left edge — every contiguous range in one O(n) sweep.
---

## The idea

Many problems ask about **contiguous** pieces of an array or string: the longest substring with no repeats, the shortest subarray whose sum reaches a target, the best profit between a buy day and a later sell day. The brute force looks at every `(start, end)` pair. There are about `n²/2` of them, and checking each one often costs another `O(n)`.

A sliding window looks at the same ranges without starting over each time. Picture two fingers on the array, `left` and `right`. Everything between them, inclusive, is the **window**. You keep a small summary of what is inside (a sum, a count of each character, the number of distinct values), and you update that summary as the fingers move:

```
index:   0   1   2   3   4   5   6
value:   a   b   c   a   b   c   b
             └───────┘
            left    right        window = "bca", counts {a:1, b:1, c:1}
```

- Moving `right` one step **adds** one element to the window.
- Moving `left` one step **removes** one element from the window.

Both fingers only ever move forward. `right` walks from `0` to `n - 1` once, and `left` follows behind it, never passing it. So every element enters the window once and leaves at most once. That is `2n` updates in total, which is why the whole scan is `O(n)` as long as each add and remove is `O(1)`.

The skill is deciding **when to move which finger**. The usual rule: always advance `right`. Then advance `left` only while the window is "broken" (it violates the condition) or while it is still "good enough" (when you want the shortest valid window).

## When to reach for it

Look for these signals in the statement:

- The answer is a **contiguous** subarray or substring: "longest", "shortest", "maximum sum", "number of subarrays".
- There is a condition on the window that you can check from a running summary: "at most `k` distinct", "no repeated characters", "sum at least `target`", "contains every character of `t`".
- The condition is **monotone**: if a window is valid, shrinking it keeps it valid (for "at most" conditions), or growing it keeps it valid (for "at least" conditions). This is what makes it safe to move `left` forward and never look back.
- A fixed size: "every window of length `k`", "average of each block of `k`".

Look-alikes that need something else:

| Statement says | Why the window fails | Use instead |
| --- | --- | --- |
| Subsequence (not contiguous) | Skipped elements break the "two fingers" picture | Dynamic programming, two pointers on two strings |
| Sum equals `k` with **negative** numbers | Shrinking can make the sum go up, so the condition is not monotone | Prefix sums with a hash map |
| Pair or triplet with a target sum in a sorted array | You care about two positions, not the range between them | Two pointers from both ends |
| Max or min of every window | The summary (the max) cannot be updated in `O(1)` on removal with a plain variable | Sliding window plus a monotonic deque |

## How it works

Take "longest substring without repeating characters" on `"abcabcb"`. The window is valid when no character appears twice. Keep `count[c]` for the characters inside.

| step | right adds | window after adding | broken? | left moves | window after fixing | best |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | a | `a` | no | – | `a` | 1 |
| 2 | b | `ab` | no | – | `ab` | 2 |
| 3 | c | `abc` | no | – | `abc` | 3 |
| 4 | a | `abca` | yes, two `a` | drop `a` | `bca` | 3 |
| 5 | b | `bcab` | yes, two `b` | drop `b` | `cab` | 3 |
| 6 | c | `cabc` | yes, two `c` | drop `c` | `abc` | 3 |
| 7 | b | `abcb` | yes, two `b` | drop `a`, drop `b` | `cb` | 3 |

The **invariant**: after the fixing step, the window `[left, right]` is the longest valid window that ends at `right`. Why longest? `left` only moved past a character when keeping it made the window invalid, and any window that starts further left contains the same duplicate. Every valid substring ends at some `right`, so checking the best window at each `right` covers all of them.

## Templates

### Longest valid window

```ts
function longestValid(a: number[]): number {
  let left = 0
  let best = 0
  for (let right = 0; right < a.length; right++) {
    add(a[right])
    while (isBroken()) {
      remove(a[left])
      left++
    }
    // Here [left, right] is valid and as long as it can be for this right.
    best = Math.max(best, right - left + 1)
  }
  return best
}
```

- `add`, `remove` and `isBroken` stand for whatever summary the problem needs. They must each be `O(1)` (or `O(alphabet)` for a fixed small alphabet).
- Record the answer **after** the `while`, when the window is valid again.
- The window length is `right - left + 1`. Forgetting the `+ 1` is the most common bug in this pattern.

### Shortest window that satisfies a requirement

```ts
function shortestValid(a: number[]): number {
  let left = 0
  let best = Infinity
  for (let right = 0; right < a.length; right++) {
    add(a[right])
    while (isSatisfied()) {
      // Record first: this window is valid, and we are about to break it.
      best = Math.min(best, right - left + 1)
      remove(a[left])
      left++
    }
  }
  return best === Infinity ? 0 : best
}
```

- The roles flip. In the "longest" template you shrink while the window is broken. Here you shrink while it is **still good**, to find the smallest good one.
- Record the answer **inside** the `while`, before removing.

### Fixed window of size `k`

```ts
function everyWindow(a: number[], k: number): number[] {
  const result: number[] = []
  for (let i = 0; i < a.length; i++) {
    add(a[i])
    if (i >= k) {
      remove(a[i - k]) // the element that just fell out of the window
    }
    if (i >= k - 1) {
      result.push(currentAnswer())
    }
  }
  return result
}
```

- No `left` variable is needed: the left edge is always `i - k + 1`.
- Only start recording once the first full window exists, at `i = k - 1`.

### Choosing a template

- "Longest", "maximum length", "at most": the **longest** template.
- "Shortest", "minimum length", "smallest window containing": the **shortest** template.
- "Each window of size `k`", "every block of `k`": the **fixed** template.
- "Count the subarrays where ...": the longest template, adding `right - left + 1` to the count at each step. Every valid window ending at `right` is one of the subarrays `[left..right]`, `[left+1..right]`, ..., `[right..right]`.

## Choosing what to track

The window's summary decides whether each update stays `O(1)`:

| Condition | Track | Broken / satisfied check |
| --- | --- | --- |
| Sum at most / at least a target (non-negative numbers) | `sum` | compare `sum` with the target |
| No repeated characters | count per character | the count of the character just added is above 1 |
| At most `k` distinct values | count per value plus `distinct` | `distinct > k` |
| At most `k` replacements to make all equal | counts plus `maxCount` | `windowLength - maxCount > k` |
| Contains every character of `t` | `need` counts plus a single `missing` counter | `missing === 0` |
| Max or min of the window | a deque of indices, values kept monotonic | the front of the deque |

For lowercase letters, an array of 26 numbers indexed by `s.charCodeAt(i) - 97` is faster and simpler than a `Map`. For arbitrary values, use a `Map` and delete keys whose count drops to zero, so `map.size` stays equal to the number of distinct values.

## Worked problems

**Best Time to Buy and Sell Stock.** The window is "from the cheapest day so far up to today". You don't even need `left` explicitly: keep the minimum price seen so far, and at each day compare today's price minus that minimum with the best profit. This is the window idea at its smallest.

**Longest Substring Without Repeating Characters.** The longest template with a count per character. The window breaks the moment the character you just added has a count of 2. Shrink until it is back to 1.

**Longest Repeating Character Replacement.** The window is valid when the characters that are *not* the most common one number at most `k`: `length - maxCount <= k`. The twist: `maxCount` is never decreased when you shrink. Because you only care about windows longer than the best you have already seen, a stale `maxCount` can only make you keep a window that is no longer than one you have already counted.

**Minimum Window Substring.** The shortest template. Keep `need[c]` (how many more of `c` the window still needs) and one counter `missing`. When `missing` reaches 0, the window covers `t`: record it, then shrink until it no longer does.

## Variations and tricks

- **Exactly `k`.** "Exactly" is not monotone: shrinking can move you from exactly `k` to `k - 1`. Count windows with *at most* `k` and subtract those with at most `k - 1`. Both of those are monotone, so each is one longest-template pass.
- **Monotonic deque for window max.** Keep indices in a deque whose values are decreasing. Before pushing `i`, pop smaller values from the back: they can never be the max while `i` is in the window. Pop the front when it falls out of the window. The front is always the max. `O(n)` total, because each index is pushed and popped once.
- **`if` instead of `while` for longest windows.** If you only need the length, you can shrink by one step with an `if`. The window then never gets shorter than the best length found, which is exactly what you want to report.
- **Two summaries for anagrams.** For "is some window a permutation of `p`", compare a 26-count array of the window with the one for `p`, or keep a `matches` counter of how many letters agree, so each step is `O(1)`.

## Complexity

- Time `O(n)` for the variable and fixed templates: each index is added once and removed at most once. Add the cost of each update, which is `O(1)` with arrays and maps.
- Space `O(1)` for a sum or a 26-count array, `O(k)` or `O(distinct values)` for a map, and `O(k)` for a deque.

## Pitfalls

- Window length `right - left` instead of `right - left + 1`.
- Forgetting to decrement the count when `left` moves, or leaving zero-count keys in a `Map` and then trusting `map.size`.
- Recording the answer at the wrong moment: after the `while` for "longest", inside it for "shortest".
- Using a window when numbers can be negative and the question is about sums. Shrinking no longer helps, so switch to prefix sums.
- Comparing two `Map`s with `===` (always false). Compare counts key by key, or keep a match counter.
- Moving `left` past `right`. In the shortest template, `isSatisfied()` must be false for an empty window, or the loop runs away.

## Practice ladder

1. [Best Time to Buy and Sell Stock](/problems/best-time-to-buy-and-sell-stock): the window idea with one running minimum.
2. [Longest Substring Without Repeating Characters](/problems/longest-substring-without-repeating-characters): the longest template with a count per character.
3. [Longest Repeating Character Replacement](/problems/longest-repeating-character-replacement): a validity rule written as arithmetic on the window.
4. [Permutation in String](/problems/permutation-in-string): a fixed-size window compared with a target count.
5. [Max Consecutive Ones III](/problems/max-consecutive-ones-iii): "at most `k` bad elements" in its plainest form.
6. [Fruit Into Baskets](/problems/fruit-into-baskets): at most two distinct values, with a map.
7. [Subarrays with K Different Integers](/problems/subarrays-with-k-different-integers): exactly `k` as at most `k` minus at most `k - 1`.
8. [Minimum Window Substring](/problems/minimum-window-substring): the shortest template with a `missing` counter.
9. [Sliding Window Maximum](/problems/sliding-window-maximum): a fixed window plus a monotonic deque.
