**Key insight:** at most two values can each exceed `n / 3`. Run Boyer–Moore voting with **two** candidates — a value different from both cancels one vote from each — then verify the survivors.

## Approach

1. Keep `(cand1, count1)` and `(cand2, count2)`.
2. For each `x`, in this order:
   - `x === cand1` → `count1++`; else `x === cand2` → `count2++`;
   - else `count1 === 0` → `cand1 = x, count1 = 1`; else `count2 === 0` → `cand2 = x, count2 = 1`;
   - else decrement both counters (this `x` cancels one of each).
3. Second pass: count the actual occurrences of both candidates and keep those above `⌊n / 3⌋`.

## Complexity

- Time `O(n)` — two passes.
- Space `O(1)`.

## Alternatives to mention

- Hash map of counts: `O(n)` time and space; straightforward and often accepted first.
- Generalisation: for "more than `n / k`", keep `k - 1` candidates.

## Pitfalls

- The verification pass is mandatory: unlike Majority Element I, nothing guarantees the candidates qualify.
- Check equality with *both* candidates before reassigning an empty slot, or the same value can occupy both slots.
