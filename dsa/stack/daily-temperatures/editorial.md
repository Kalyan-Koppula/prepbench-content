**Key insight:** this is "next greater element" returning a distance. A stack of unresolved days, kept in non-increasing temperature order, resolves each day the moment a warmer one arrives.

## Approach

1. Scan days left to right with a stack of indices still waiting.
2. While today is warmer than the day on top, pop it and set `answer[popped] = i - popped`.
3. Push today.
4. Days left on the stack never see a warmer day; they keep the default `0`.

## Complexity

- Time `O(n)` — each index is pushed and popped at most once.
- Space `O(n)` for the stack in the worst case (falling temperatures).

## Alternatives to mention

- Brute force: scan forward from every day — `O(n²)`.
- Right-to-left with "jumps": for day `i`, start at `j = i + 1` and hop `j += answer[j]` until warmer or `answer[j] === 0`. `O(n)` amortised, `O(1)` extra space beyond the output.
- Since temperatures are bounded (30–100), a right-to-left scan keeping the next index of each temperature gives `O(n · 71)`.

## Pitfalls

- Using `<=` when popping — equal temperatures are not warmer.
- Storing temperatures instead of indices — you need the index to compute the distance.
