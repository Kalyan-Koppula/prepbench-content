---
title: Stack & Monotonic Stack
order: 4
summary: Last in, first out. Match nested pairs, and find every element's nearest greater or smaller neighbour in one O(n) pass.
---

## The idea

A stack is a pile of plates: you can only add to the top and take from the top. That one rule, **last in, first out**, fits a surprising number of problems, because many inputs are built so that the most recent unfinished thing must be dealt with first.

Two flavours show up in interviews.

**The plain stack holds unfinished work.** Read `"{[()]}"` left to right. Every opener is a promise that a matching closer will come later. When a closer arrives, it can only settle the most recent unkept promise. Anything older is still enclosed by the newer one. The stack holds exactly the open promises, newest on top.

```
read:    {     [     (     )     ]     }
stack:   {     {[    {[(   {[    {     (empty)
                           ↑ ")" settles "(" on top
```

**The monotonic stack holds elements still waiting for an answer.** Suppose you want, for each element, the first later element that is bigger. Walk left to right and keep a stack of indices that have not found their bigger neighbour yet. When a new value arrives, it is the answer for every waiting element smaller than it, and those elements all sit together at the top. Pop them, record the answer, then push the new element, which now waits too.

Because you pop everything smaller before pushing, the values left on the stack always **decrease from bottom to top**. That ordering is what "monotonic" means, and it is never something you maintain on purpose. It falls out of the popping rule.

```
values waiting (bottom → top):   9   6   4   2        new value: 5
pop 2 (answer 5), pop 4 (answer 5), stop at 6 (6 > 5)
after push:                       9   6   5
```

Every index is pushed once and popped at most once. The inner `while` loop can run many times on one step, but across the whole scan it runs at most `n` times in total. So the scan is `O(n)`, compared with `O(n²)` for checking every later element for every index.

## When to reach for it

Signals in the statement:

- **Nesting or pairing**: brackets, tags, nested function calls, "undo the last action", a backspace that deletes the previous character.
- **The newest item reacts first**: collisions where a new object meets the closest survivor, operators that apply to the two most recent values.
- **"Next" or "previous" plus "greater", "smaller", "warmer", "taller"**: days until a warmer day, the nearest taller building, the first bar shorter than this one.
- **Spans and widths**: "how many consecutive days before today were at most today's price", "how wide can a rectangle of this height stretch".
- **Sums or counts over all subarrays where each subarray contributes its min or max.** Flip it around: for each element, count the subarrays in which it is the min. The boundaries of those subarrays are nearest-smaller questions.
- **A data structure with an extra `O(1)` query**: "a stack that also reports its minimum".

Look-alikes that need something else:

| Statement says | Why a stack is the wrong tool | Use instead |
| --- | --- | --- |
| Max or min of every window of size `k` | Old elements must leave from the bottom as the window slides | A monotonic deque, see [Sliding Window](/problems/patterns/sliding-window) |
| Process items in arrival order | That is first in, first out | A queue |
| The `k` largest values, or repeated "give me the smallest" with inserts anywhere | You need the global extreme, not the nearest one | A [heap](/problems/patterns/heap) |
| Count of greater elements anywhere to the right | Not "the first" greater one, so earlier pops lose information | Sorting with merge counts, or a Fenwick tree |
| List every valid bracket string | Nothing to read, you are building strings | [Backtracking](/problems/patterns/backtracking) with open and close counters |

## How it works

Take "next greater element to the right" on `[5, 3, 1, 4, 7, 2]`. The answer for an index is the first later value that is strictly larger, or `-1`. The stack holds indices; the values are shown in brackets.

| i | value | popped (and their answer) | stack after push (bottom → top) |
| --- | --- | --- | --- |
| 0 | 5 | – | 0(5) |
| 1 | 3 | – (5 is not smaller) | 0(5) 1(3) |
| 2 | 1 | – | 0(5) 1(3) 2(1) |
| 3 | 4 | 2(1) → 4, 1(3) → 4 | 0(5) 3(4) |
| 4 | 7 | 3(4) → 7, 0(5) → 7 | 4(7) |
| 5 | 2 | – | 4(7) 5(2) |

Indices 4 and 5 are still on the stack at the end, so nothing later beats them. The answer is `[7, 4, 4, 7, -1, -1]`. Six pushes and four pops, matching the bound of at most `2n` stack operations.

**The invariant**: after step `i`, the stack holds exactly the indices `j <= i` whose next greater element has not appeared in `[j + 1, i]`, and their values decrease from bottom to top.

**Why the answer is correct.** An index is popped at the first `i` with a larger value. It could not have been popped earlier, because every earlier value was too small to beat it. It can't be missed either: if `nums[i]` is larger than the top, the loop pops it. And if `nums[i]` is not larger than the top, it cannot be larger than anything below, because those values are bigger still. That is why the loop may stop at the first top that survives.

**Why it is fast.** Charge each pop to the index being popped. An index is popped at most once, so the total work over all steps is `O(n)`, even though a single step can pop many indices. Interviewers often ask about the nested loop, so give this amortised argument out loud.

## Templates

### Matching pairs (plain stack)

```ts
function isBalanced(s: string): boolean {
  const openerFor = new Map<string, string>()
  openerFor.set(')', '(')
  openerFor.set(']', '[')
  openerFor.set('}', '{')
  const stack: string[] = []
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]
    const opener = openerFor.get(ch)
    if (opener === undefined) {
      stack.push(ch) // an opener: it waits for its closer
    } else {
      if (stack.length === 0 || stack[stack.length - 1] !== opener) {
        return false
      }
      stack.pop()
    }
  }
  return stack.length === 0
}
```

- Check for an empty stack **before** reading the top. In JavaScript `stack[-1]` and `[].pop()` both give `undefined` without an error, so the bug stays hidden.
- The final `stack.length === 0` catches unclosed openers such as `"(("`. Without it, half the failing cases pass.
- Map each closer to its opener, not the other way round. Then a single lookup tells you both "is this a closer?" and "what must be on top?".

### Next greater element (decreasing stack)

```ts
function nextGreater(nums: number[]): number[] {
  const n = nums.length
  const answer = new Array(n).fill(-1)
  const stack: number[] = [] // indices still waiting for a greater value
  for (let i = 0; i < n; i++) {
    while (stack.length > 0 && nums[stack[stack.length - 1]] < nums[i]) {
      const waiting = stack[stack.length - 1]
      stack.pop()
      answer[waiting] = nums[i]
    }
    stack.push(i)
  }
  return answer // indices never popped keep -1
}
```

- Store **indices**, not values. You can always read the value back through the index, but you cannot get a distance (`i - waiting`) from a value.
- The comparison decides strictness. `<` gives "strictly greater"; `<=` gives "greater or equal". Read the statement for which one it asks for.
- Do the work for an index when it is **popped**. That is the moment its answer becomes known.
- To answer "previous greater" instead, read the top **after** the `while` and before the push: whatever survives on top is the nearest earlier value that is larger than the current one.

### Both boundaries in one pass (increasing stack)

Many hard problems need, for each index, the nearest smaller element on **both** sides. One pass gives both:

```ts
function smallerBounds(a: number[]): number[][] {
  const n = a.length
  const left = new Array(n).fill(-1) // previous strictly smaller, or -1
  const right = new Array(n).fill(n) // next smaller-or-equal, or n
  const stack: number[] = [] // indices, values increasing bottom to top
  for (let i = 0; i < n; i++) {
    while (stack.length > 0 && a[stack[stack.length - 1]] >= a[i]) {
      right[stack[stack.length - 1]] = i
      stack.pop()
    }
    if (stack.length > 0) {
      left[i] = stack[stack.length - 1] // the survivor below is smaller
    }
    stack.push(i)
  }
  return [left, right]
}
```

- The element that pops `j` is `j`'s right boundary. The element still below `i` after the popping is `i`'s left boundary. One loop, two answers.
- One side is strict (`left`), the other is not (`right`). With duplicates this credits each subarray to exactly one index. If both sides were strict, a subarray like `[2, 2]` would be counted for both twos.
- The defaults `-1` and `n` act as walls just outside the array. Then the width an element controls is always `right[i] - left[i] - 1`, with no special cases.

### Choosing a template

| You need | Stack order (bottom → top) | Pop while top is | Answer recorded |
| --- | --- | --- | --- |
| Next greater | decreasing | smaller than current | for the popped index |
| Next smaller | increasing | larger than current | for the popped index |
| Previous greater | decreasing | smaller than or equal to current | for current, from the survivor on top |
| Previous smaller | increasing | larger than or equal to current | for current, from the survivor on top |
| Matching, undo, nesting | no order | the partner of the current item | when a pair closes |

A quick memory hook: to find **greater** neighbours, pop the **smaller** ones. The popped elements have just met their answer.

## Choosing what to keep on the stack

What each entry stores decides which questions you can answer in `O(1)`:

| Problem shape | Each entry holds | Why |
| --- | --- | --- |
| Bracket matching | the opener character | compare with the closer's partner |
| Next greater or smaller, distances | the index | gives both the value and the distance |
| Expression evaluation | a number (operand) | operators consume the top two |
| Min or max on demand | the value plus the minimum at push time | the minimum below never changes while this entry is on top |
| Spans | the value plus the count of items it absorbed | a popped entry's whole span merges into the new one |
| Simulation (collisions) | the survivor | only the newest survivor can meet the next item |

Use a plain JavaScript array with `push`, `pop` and `stack[stack.length - 1]`. Never use `shift` or `unshift`: they move every element and cost `O(n)`. When an entry needs two fields, either keep two parallel arrays that you push and pop together, or push small two-element arrays and read them by index.

## Worked problems

**Valid Parentheses.** The plain matching template with no twist. The stack holds openers that are still unclosed. A closer must find its own partner on top, and the stack must be empty at the end. The early exit on an odd-length string is a nice touch but not required.

**Daily Temperatures.** Next greater element, except the answer is a distance rather than a value. The stack holds the indices of days still waiting for a warmer day, with temperatures decreasing upwards. When today is warmer than the day on top, that day's wait is `today - thatDay`. Because the comparison is "strictly warmer", equal temperatures stay on the stack.

**Asteroid Collision.** The stack holds survivors, left to right. Only one situation causes a crash: a left-mover arrives while the top is a right-mover. Keep popping smaller right-movers. The twist is the three outcomes of each meeting: the newcomer wins and keeps going, both explode on a tie, or the newcomer dies. Push it only if it survived every meeting.

**Largest Rectangle in Histogram.** Every candidate rectangle is limited by its shortest bar. So for each bar, ask how far a rectangle of exactly that height could stretch: up to the nearest shorter bar on each side. That is the both-boundaries template, with area `heights[i] * (right[i] - left[i] - 1)`. A common one-pass version pops while the top is at least as tall as the current bar, computes the area at pop time, and adds an extra iteration with height 0 at the end to flush the leftovers.

## Variations and tricks

- **Circular arrays.** To let the search wrap around, loop `i` from `0` to `2n - 1` and use `i % n` as the index. Push only during the first lap (`i < n`). The second lap only resolves elements still waiting. Each index is still pushed once.
- **Sentinel flush.** Finding "next smaller" leaves unanswered indices on the stack at the end. Instead of a cleanup loop, run one extra step with a value smaller than everything (0 for heights, `-Infinity` in general). It pops everything, so the area or contribution code lives in one place.
- **Contribution counting.** For "sum over all subarrays of the minimum", index `i` is the minimum of `(i - left[i]) * (right[i] - i)` subarrays. Multiply by `a[i]` and add up. Apply the modulus after each addition. Swap the comparisons for maxima, and subtract the two sums for "sum of ranges".
- **Augmented entries.** A min-stack pushes each value together with `min(value, current minimum)`. Popping restores the earlier minimum for free, because it was never overwritten. The same idea gives stock spans: when today's price swallows the top entry, add that entry's span to today's and drop it.
- **Sort first, then stack.** When the input order is not the order in which things interact, sort it first. For cars on a one-lane road, process them from nearest the target to farthest. Each car's arrival time either merges into the fleet ahead (arrives no later) or starts a new, slower fleet. The stack of fleet times then increases from bottom to top.
- **Postfix evaluation.** Numbers are pushed. An operator pops the right operand first and then the left one, so `a - b` and `a / b` keep their order. Truncate division towards zero with `Math.trunc`, not `Math.floor`.
- **A counter instead of a stack.** If there is only one bracket type, the stack is all the same character, so its height is the only information. A depth counter is enough: it must never go negative and must end at zero. Generate Parentheses uses exactly this rule to decide which characters may come next.
- **Scanning from the right.** "Next greater" can also be done right to left: pop everything not larger than the current value, and the survivor on top is the answer. Pick whichever direction makes the answer the survivor or the popper, whichever reads more naturally.

## Complexity

- Time `O(n)` for every template above. Each element is pushed once and popped at most once, so the inner loops do `O(n)` work across the whole scan. Circular arrays do two laps, which is still `O(n)`.
- Space `O(n)` in the worst case: a strictly decreasing input keeps every index on a "next greater" stack, and deep nesting such as `"((((("` keeps every opener.
- Design problems (min stack, stock span) are `O(1)` per operation, amortised for the span, because each entry is merged away at most once.
- Sorting first (car fleet) adds `O(n log n)`.

## Pitfalls

- Reading `stack[stack.length - 1]` or calling `pop()` on an empty stack. JavaScript returns `undefined` silently, and comparisons with `undefined` are always false, so the bug shows up far from its cause.
- Storing values when the problem needs distances or widths. Store indices.
- The wrong strictness: `<` versus `<=` decides whether equal elements pop each other. With duplicates in contribution problems, make exactly one side strict.
- Forgetting the leftovers. Elements still on the stack at the end never found an answer. Give them the default (`-1`, `0`, or `n`) or flush them with a sentinel.
- Computing a width as `right - left` instead of `right - left - 1` when both boundaries are excluded.
- Popping operands in the wrong order for `-` and `/`, or using `Math.floor` for negative division.
- Using `shift` or `unshift` and turning an `O(n)` scan into `O(n²)`.
- Forgetting the modulus in contribution sums, or applying it only at the end after the total has lost precision.

## Practice ladder

1. [Valid Parentheses](/problems/valid-parentheses): the plain stack in its purest form, matching the newest opener.
2. [Min Stack](/problems/min-stack): storing extra state in each entry so a query stays `O(1)`.
3. [Evaluate Reverse Polish Notation](/problems/evaluate-reverse-polish-notation): a stack of operands, and operand order for non-commutative operators.
4. [Generate Parentheses](/problems/generate-parentheses): the balance rule behind bracket matching, used to build strings instead of checking them.
5. [Daily Temperatures](/problems/daily-temperatures): the first monotonic stack, answering with a distance.
6. [Next Greater Element II](/problems/next-greater-element-ii): the same stack over a circular array, with two laps.
7. [Online Stock Span](/problems/online-stock-span): a monotonic stack fed one value at a time, merging spans as it pops.
8. [Asteroid Collision](/problems/asteroid-collision): simulation where the newest survivor meets each arrival.
9. [Car Fleet](/problems/car-fleet): sort into interaction order, then stack the arrival times.
10. [Sum of Subarray Minimums](/problems/sum-of-subarray-minimums): both boundaries plus contribution counting, with careful tie-breaking.
11. [Largest Rectangle in Histogram](/problems/largest-rectangle-in-histogram): both boundaries turned into widths, the classic hard monotonic stack.
