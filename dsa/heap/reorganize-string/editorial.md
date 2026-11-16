**Key insight:** it's possible exactly when no letter appears more than `⌈n / 2⌉` times. To build an answer, repeatedly place the most frequent letter that isn't the one you just placed.

## Approach

1. Count letters and push `[count, letter]` into a max-heap.
2. Keep the previously placed letter "on hold" for one step:
   - Pop the top, append it.
   - Push the held letter back (if any), then hold the current letter with its count reduced by one (or nothing, if it's used up).
3. If the heap runs dry while a letter is still held, that letter has copies left that would have to sit next to each other — return `""`.

Always taking the most frequent available letter keeps the dominant letter from piling up at the end.

## Complexity

- Time `O(n log 26)` = `O(n)`: at most 26 entries in the heap.
- Space `O(26)` plus the output.

## Alternatives to mention

- **Even/odd fill:** if the max count is `<= ⌈n / 2⌉`, write the most frequent letter at indices `0, 2, 4, …`, then continue with the remaining letters, wrapping to `1, 3, 5, …` when you run past the end. `O(n)`, no heap — a neat answer once you've stated the feasibility condition.
- This is Task Scheduler with cooldown `1`, asking for the order instead of the length.

## Pitfalls

- Checking feasibility with `> n / 2` instead of `> ⌈n / 2⌉` wrongly rejects odd lengths like `"aba"`.
- Popping the same letter twice in a row because it's still the largest — that's what the hold slot prevents.
