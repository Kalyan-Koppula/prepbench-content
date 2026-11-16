**Key insight:** a permutation of `s1` is any window of length `s1.length` with identical letter counts. Slide a fixed-size window over `s2` and keep the counts current.

## Approach

1. Count letters of `s1` (`need`) and of the first `m = s1.length` characters of `s2` (`have`).
2. Keep `matches`: how many of the 26 letters have `need[c] === have[c]`.
3. Slide: add `s2[right]`, remove `s2[right - m]`. Each change touches one letter, so `matches` is updated in O(1) — decrement if it matched before the change, increment if it matches after.
4. Whenever `matches === 26`, the current window is a permutation.

## Complexity

- Time `O(n)` for `n = s2.length` (plus `O(26)` setup).
- Space `O(26)`.

## Alternatives to mention

- Compare the two 26-length arrays each step: `O(26·n)` — perfectly acceptable and simpler to write under pressure.
- Sort each window and compare: `O(n · m log m)`.

## Pitfalls

- `s1` longer than `s2` — return `false` before indexing.
- Checking `matches` only inside the loop and forgetting the final window.
