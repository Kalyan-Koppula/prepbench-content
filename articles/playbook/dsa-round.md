---
title: The DSA Round
order: 1
summary: How to run a 45-minute coding round — clarify, plan, code, test — and what to say at each step.
---

A DSA round scores your process as much as your final code. Interviewers want to see you turn a vague prompt into a precise problem, pick a sensible approach, write clean code, and verify it without being told to. A correct answer delivered in silence often scores lower than a near-miss with clear reasoning.

## The 45-minute shape

| Minutes | Phase | Output |
|---|---|---|
| 0–5 | Clarify | Inputs, outputs, constraints, edge cases agreed |
| 5–8 | Examples | One normal case and one edge case worked by hand |
| 8–12 | Brute force | Stated (not coded) with its complexity |
| 12–20 | Optimise | Better approach agreed with the interviewer |
| 20–35 | Code | Clean, complete implementation |
| 35–42 | Test | Dry run, edge cases, bug fixes |
| 42–45 | Wrap up | Complexity, trade-offs, follow-ups |

If the round has two problems, halve everything and skip straight to the best approach you can justify on problem one.

## 1. Clarify

Restate the problem in your own words, then ask about what changes the solution:

- **Input size** — `n ≤ 20` hints at exponential/backtracking, `n ≤ 10^5` means O(n log n) or better.
- **Value range** — negatives? zero? duplicates? Fits in a 32-bit int?
- **Empty and trivial inputs** — empty array, single element, `null` root.
- **Output format** — indices or values? Any valid answer or a specific one? Sorted?
- **Mutation** — may I modify the input in place?
- **Sortedness** — is the input sorted or can I sort it?

Say: "Before I start, let me check a few constraints so I pick the right approach."

## 2. Examples

Work one small example by hand, out loud. Then construct an edge case yourself (empty input, all duplicates, negative numbers). This catches misunderstandings while they are still cheap and gives you test cases for later.

## 3. Brute force

State the obvious solution and its cost in one or two sentences. You rarely need to code it.

> "The naive approach checks every pair, which is O(n²) time and O(1) space. That's too slow for 10^5 elements, so let me look for something better."

This proves you can solve it at all and gives you a baseline to improve on.

## 4. Optimise

Ask yourself which work in the brute force is repeated, then pick a tool that removes it:

- Repeated lookups → hash map or set.
- Repeated scanning of a range → prefix sums, sliding window, two pointers.
- Searching a monotonic space → binary search (including binary search on the answer).
- Overlapping subproblems → memoisation, then a bottom-up table.
- "Best k" or "next smallest" → heap.

Talk through the idea and its complexity, then get a nod before writing code: "Does that approach sound good, or would you like me to consider something else?"

## 5. Code

- Write a function signature first and agree on it.
- Use real names (`left`, `windowSum`, `seen`) instead of `i2`, `tmp`.
- Pull fiddly logic into a small helper so the main loop reads like the plan.
- Narrate intent, not syntax: "Now I shrink the window while it's invalid", not "now I write a while loop".
- If you hit a detail you're unsure of, leave a `// TODO: handle empty` and keep moving; come back during testing.

## 6. Test

Do not say "I think that works". Trace the code, not your intention:

1. Run your small example line by line, tracking variables in a comment or table.
2. Run each edge case: empty, single element, duplicates, all negative, already sorted.
3. Look for off-by-ones at loop boundaries and the last iteration of a window.

Finding and fixing your own bug is a positive signal. An interviewer finding it for you is not.

## 7. Complexity and wrap-up

State time and space, and justify each in one clause: "O(n) time because each pointer moves at most n steps; O(k) space for the window map." Mention what you'd change for a follow-up (streaming input, memory limits, very large values).

## What to say out loud

| Moment | Example phrasing |
|---|---|
| Starting | "Let me restate the problem to make sure I've got it right." |
| Choosing | "I'm considering two options; the hash map is O(n) but uses extra space." |
| Committing | "I'll go with the two-pointer approach since the array is sorted." |
| Pausing | "Give me a moment to think through the update rule." |
| Testing | "Let me trace this with `[2, 7, 11]`, target 9." |
| Finding a bug | "This fails when the window is empty; I'll guard that case." |

Silence longer than about 30 seconds makes interviewers nervous. Thinking aloud, even half-formed, lets them nudge you.

## Recovering when stuck

- **Go back to examples.** Solve a slightly bigger case by hand and watch what you actually do; that's often the algorithm.
- **Simplify.** Solve it for sorted input, for unique values, or for k = 1, then generalise.
- **Run the pattern list.** Ask "could a hash map / two pointers / binary search / heap / DP help here?"
- **Change representation.** Sort, build a graph, compute prefix sums, or count frequencies.
- **Ask for a hint gracefully.** "I'm stuck between X and Y; is either in the right direction?" A hint taken well costs little; spinning for ten minutes costs a lot.
- **Ship something.** If time is short, code the brute force cleanly and explain the optimisation verbally.

## Pattern recognition

| Signal in the problem | Likely pattern |
|---|---|
| "Pair / triple summing to target", sorted input | Two pointers |
| "Have I seen this before?", counting, grouping | Hash map / set |
| "Longest / shortest contiguous subarray or substring with property" | Sliding window |
| "Subarray sums to k", range sums | Prefix sum + hash map |
| Sorted array, "find position", or "minimum value that works" | Binary search (on index or answer) |
| "Next greater / smaller element", matching brackets | Monotonic stack / stack |
| "Top k", "k-th largest", merge k sorted | Heap |
| Overlapping intervals, meeting rooms | Sort by start, then sweep |
| Tree depth, paths, subtree properties | DFS recursion |
| Shortest path in unweighted grid, level order | BFS |
| Dependencies, ordering of tasks | Topological sort |
| Connectivity, "number of groups" | Union-find or DFS |
| "All combinations / permutations / subsets", `n ≤ 20` | Backtracking |
| "Number of ways", "min cost", choices with overlap | Dynamic programming |
| Prefix lookups over many words | Trie |
| In-place on linked list, cycle, middle | Fast and slow pointers |
| Values in `1..n` in an array of size n | Index as hash / cyclic sort |

## A worked round: "Longest substring without repeating characters"

Here is how a strong candidate runs the full round, with the words they say.

**Clarify (2 minutes).** "Is the input ASCII or any Unicode? Can it be empty? Do you want the length or the substring itself?" The interviewer says: any characters, may be empty, return the length.

**Examples (2 minutes).** "For `abcabcbb` the answer is 3 (`abc`). For `bbbb` it's 1. For the empty string, 0. For `pwwkew` it's 3 (`wke`), which shows the window can start in the middle."

**Brute force (3 minutes).** "Check every substring for duplicates: `O(n²)` substrings, each checked in up to `O(n)` with a set, so `O(n³)`, or `O(n²)` if I extend each start and stop at the first repeat. Correct but too slow for 10⁵ characters."

**Optimise (5 minutes).** "When I extend the end and hit a repeat, every substring that starts before the earlier copy is invalid too. So I can move the start past the earlier copy instead of restarting. That's a sliding window: each pointer only moves forward, so `O(n)`. I'll store the last index of each character in a map."

**Code (10 minutes).**

```js
function lengthOfLongestSubstring(s) {
  const lastSeen = new Map()
  let start = 0
  let best = 0
  for (let end = 0; end < s.length; end++) {
    const c = s[end]
    if (lastSeen.has(c) && lastSeen.get(c) >= start) {
      start = lastSeen.get(c) + 1 // jump past the earlier copy
    }
    lastSeen.set(c, end)
    best = Math.max(best, end - start + 1)
  }
  return best
}
```

**Test (5 minutes).** The candidate traces `abba` aloud, because it catches the classic bug: at the second `a`, its last index (0) is **before** `start` (2), so the window must not move backwards. The `>= start` check handles it. Then the empty string (loop doesn't run, returns 0) and `bbbb`.

**Complexity (1 minute).** "`O(n)` time; `O(min(n, alphabet))` space for the map."

What made it strong: the candidate stated the brute force with its cost, derived the optimisation from the brute force's wasted work instead of announcing a pattern name, and tested a case chosen to break the code.

## Practising effectively

- **Solve by pattern, not by count.** Work through one pattern at a time (two pointers, sliding window, BFS, DP) until you can recognise it from the problem statement alone; see the pattern sheets on the [DSA hub](/dsa), starting with [Sliding Window](/problems/patterns/sliding-window) for this problem.
- **Time-box.** Give a problem 25–30 minutes, then read the solution, then re-solve it from scratch a few days later. The re-solve is where learning sticks.
- **Say it out loud.** Practise explaining while coding; it is a separate skill from solving.
- **Keep a mistakes log.** Off-by-one in binary search, forgetting to mark visited before enqueueing, wrong loop direction in knapsack. Reviewing it before interviews prevents repeats.
- **Mock interviews** with a peer expose communication gaps that solo practice hides.

## Common interview questions

**Should I code the brute force first?**
Usually no. State it with its complexity, then optimise. Code it only if you're stuck or the interviewer asks.

**What if I already know the problem?**
Still walk through clarification and the reasoning. Jumping straight to a memorised answer looks rehearsed, and the follow-up will test whether you understand it.

**How much should I optimise?**
Until you hit the expected bound for the constraints, then stop. Ask "is this complexity acceptable?" rather than guessing.

**TypeScript or JavaScript?**
Either; use whichever you write fastest. Types on the function signature help communicate intent without slowing you down.

**What if I run out of time mid-code?**
Describe the remaining steps precisely and give the final complexity. A clear plan with partial code beats rushed, broken code.

## Pitfalls

- Coding before agreeing on the approach, then rewriting halfway through.
- Ignoring the constraints in the prompt; they tell you the target complexity.
- Mutating input without asking.
- Forgetting the empty-input case and the last element of a loop.
- Claiming O(n) when there's a hidden `indexOf`, `slice` or `includes` inside a loop.
- Using `arr.sort()` on numbers without a comparator — it sorts as strings.

## Key takeaways

- Follow the shape: clarify, examples, brute force, optimise, code, test, complexity.
- State the brute force and its cost before optimising; derive the optimisation from its wasted work.
- Narrate decisions, not keystrokes.
- Test with a case designed to break your code, then the edge cases.
- When stuck, return to examples, simplify the problem, or ask which constraint matters.
