**Key idea:** keep a stack of days that are still waiting for a warmer day. Their temperatures never increase from bottom to top. When a warmer day arrives, it is the answer for every cooler day on top of the stack: pop them and record the distance.

## Recognising the pattern

"For each element, the next element to the right that is greater" is the definition of a **next greater element** problem, and that is the home turf of the monotonic stack in the [Stack](/problems/patterns/stack) sheet. The stack holds the elements whose answer hasn't been found yet.

## Brute force

For each day, scan forward until a warmer day appears, and record the distance (or 0). That is the reference brute force below.

Correct by definition. Time `O(n²)` in the worst case, for example when temperatures only fall. Space `O(1)` beyond the output.

## Optimal: monotonic stack of waiting days

1. `answer` = all zeros; `waiting` = empty stack of indices.
2. For each day `i`:
   1. While the day on top of `waiting` is cooler than `temperatures[i]`: pop it as `day`, and set `answer[day] = i - day`.
   2. Push `i`.
3. Days still on the stack never found a warmer day and keep 0.

**Why the stack stays non-increasing.** Before pushing `i`, every cooler day was popped, so whatever remains on top is at least as warm as day `i`. That is also why each day is resolved by the **first** warmer day: it stays on the stack until the first day that beats it arrives.

Each index is pushed once and popped at most once, so the nested `while` adds only `O(n)` work in total.

## Walkthrough

`temperatures = [73, 74, 75, 71, 69, 72, 76, 73]`

| i | temp | popped (answer) | stack after (temps) |
| --- | --- | --- | --- |
| 0 | 73 | – | [73] |
| 1 | 74 | day 0 → 1 | [74] |
| 2 | 75 | day 1 → 1 | [75] |
| 3 | 71 | – | [75, 71] |
| 4 | 69 | – | [75, 71, 69] |
| 5 | 72 | day 4 → 1, day 3 → 2 | [75, 72] |
| 6 | 76 | day 5 → 1, day 2 → 4 | [76] |
| 7 | 73 | – | [76, 73] |

Answer `[1, 1, 4, 2, 1, 1, 0, 0]`.

## Complexity

- Brute force: time `O(n²)`, space `O(1)`.
- Monotonic stack: time `O(n)`, each index pushed and popped at most once. Space `O(n)` for the stack.

## Edge cases

- Strictly decreasing temperatures: nothing is ever popped, so all answers are 0.
- Equal temperatures: "strictly warmer" means an equal day does not resolve a waiting day. The comparison must be `<`, not `<=`.
- The last day always has answer 0.

## Common mistakes

- Pushing temperatures instead of indices, which loses the information needed for the distance.
- Using `<=` when popping, which treats an equally warm day as warmer.
- Thinking the nested loop is `O(n²)`. Explain the "each index popped once" argument.

## In the interview

- Name the pattern: next greater element, monotonic stack.
- Likely follow-ups:
  - *Iterate from the right instead?* Keep a stack of candidates for "next warmer", popping those that are not warmer than today. Same complexity.
  - *Fixed range of temperatures (30–100)?* Scan right to left keeping the earliest index of each temperature; `O(n · 71)`.
  - *Previous warmer day?* The same stack, scanning left to right but reading the answer from the top after popping.
