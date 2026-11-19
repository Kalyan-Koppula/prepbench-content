**Key idea:** you don't need to decide what each `*` is. Track the **range** of possible unmatched `(` counts: `low` (if every `*` so far closed something or vanished) and `high` (if every `*` opened). If `high` drops below 0, there are too many `)` whatever you choose. Clamp `low` at 0. At the end the string is valid if `low` is 0, meaning some choice leaves nothing open.

## Recognising the pattern

Wildcards with three choices each look like backtracking (`3^n`). But the only thing that matters about a prefix is how many `(` are still open, and the set of possible counts is always a contiguous range. A range is two numbers, so a greedy from the [Greedy](/problems/patterns/greedy) sheet tracks it in one pass. The [Stack](/problems/patterns/stack) sheet's balance counter is the same idea without wildcards.

## Brute force

Keep a boolean array of every possible open count after each character: `(` shifts counts up, `)` shifts down (never below 0), `*` does all three. That is the reference brute force below. `O(n²)` time. Plain backtracking over the choices would be `O(3^n)`.

## Range of open counts

1. `low = high = 0`.
2. For each character:
   - `(`: `low++`, `high++`.
   - `)`: `low--`, `high--`.
   - `*`: `low--` (use it as `)`), `high++` (use it as `(`).
   - If `high < 0`, return false.
   - If `low < 0`, set `low = 0`.
3. Return `low === 0`.

**Why clamp `low`.** A negative count would mean closing a bracket that was never opened. Clamping discards those impossible choices (for example, a `*` that would have been a `)` becomes an empty string instead).

**Why the possible counts form a range.** Each `*` turns a range `[low, high]` into `[low − 1, high + 1]`, which is still a range with no gaps; `(` and `)` just shift it. So every count between `low` and `high` is achievable.

## Walkthrough

`s = "*)(*"`

| char | low | high | note |
| --- | --- | --- | --- |
| * | −1 → 0 | 1 | clamp |
| ) | −1 → 0 | 0 | |
| ( | 1 | 1 | |
| * | 0 | 2 | |

`low = 0`, so valid: `"()()"`. For `"((*"`, the range ends at `[1, 3]`; `low = 1` means at least one `(` is always left open, so `false`.

## Complexity

- Backtracking: `O(3^n)`.
- All possible counts: `O(n²)` time, `O(n)` space.
- Range: `O(n)` time, `O(1)` space.

## Edge cases

- Empty string: valid.
- Only stars: valid (all empty).
- A `)` first: valid only if a `*` comes before it; otherwise `high` goes negative.

## Common mistakes

- Returning `high ≥ 0` at the end instead of `low = 0`.
- Forgetting to clamp `low`, which rejects valid strings: in `"*)(*"` above, `low` would be −2 after the first two characters and could never return to 0.
- Two stacks (indices of `(` and of `*`) is another valid `O(n)` approach; mixing it with the counter approach leads to bugs.

## In the interview

- Explain why the set of counts is a range; then the two counters are obvious.
- Likely follow-ups:
  - *Return a valid assignment?* Use the two-stack method: match `)` with `(` first, then `*`; then match leftover `(` with later `*`.
  - *Minimum insertions to make plain parentheses valid?* A balance counter that counts the deficits.
