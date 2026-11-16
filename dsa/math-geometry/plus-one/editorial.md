**Key insight:** only a trailing run of `9`s is affected by the carry — turn them into `0`s and bump the first non-`9` digit; if there isn't one, prepend a `1`.

## Approach

1. Walk from the last digit to the first.
2. If the digit is below `9`, increment it and return — the carry is absorbed.
3. Otherwise set it to `0` and keep going.
4. If the loop finishes, every digit was `9`; return `[1, 0, 0, …]`.

## Complexity

- Time `O(n)` worst case (all nines), `O(1)` typically.
- Space `O(1)` extra beyond the output.

## Alternatives to mention

- Converting to a number and back breaks past `2^53` — with up to 100 digits, `Number` loses precision. `BigInt` works but misses the point of the exercise.

## Pitfalls

- Forgetting the all-nines case returns `[0, 0, 0]` instead of `[1, 0, 0, 0]`.
- Mutating the input is fine on LeetCode; here the solution copies it to keep the function pure.
