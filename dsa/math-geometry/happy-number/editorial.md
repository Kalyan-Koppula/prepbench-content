**Key insight:** the digit-square map quickly shrinks any number below a few hundred, so the sequence must repeat — the question is just whether the repeat is `1 → 1` or some other loop. That's cycle detection.

## Approach

1. Define `next(x)` = sum of squares of the digits of `x`.
2. Run Floyd's tortoise and hare: `slow` advances one step, `fast` two.
3. Stop when `fast` hits `1` (happy) or `slow === fast` (a cycle without `1`).

The hash-set version is equally acceptable: keep applying `next` and stop when you see `1` or a repeated value.

## Complexity

- Time `O(log n)` — the first step reduces a 10-digit number to at most `10 · 81 = 810`; from there the sequence stays small and loops within a bounded number of steps.
- Space `O(1)` for Floyd's; `O(log n)`-ish (a bounded set) for the hash-set version.

## Alternatives to mention

- Every unhappy number eventually enters the single cycle `4 → 16 → 37 → 58 → 89 → 145 → 42 → 20 → 4`, so `while (n !== 1 && n !== 4)` also works. Mention it as a curiosity — it relies on a fact you'd have to justify.

## Pitfalls

- Forgetting to check `1` before the cycle test: `1` itself is a fixed point, so `slow === fast` happens there too — test `fast === 1` to decide the answer.
