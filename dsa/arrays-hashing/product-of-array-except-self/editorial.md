**Key idea:** the product of everything except `nums[i]` splits into two halves: everything to the left of `i` times everything to the right of `i`. Both halves are running products, so one sweep from each end builds every answer without dividing.

## Recognising the pattern

Every output entry is an aggregate over "the whole array minus one position". Whenever an answer for index `i` depends on a range ending just before `i` and a range starting just after it, think **prefix and suffix aggregates**: compute each side once with a running value instead of re-scanning per index. That is a core trick on the [Arrays & Hashing](/problems/patterns/arrays-hashing) sheet, and the same idea shows up as prefix sums elsewhere.

Recomputing the product for each index is quadratic, about 10 billion multiplications at `n = 10^5`. The obvious shortcut, total product divided by `nums[i]`, is ruled out by the statement and breaks on zeros anyway.

## Brute force

For each index `i`, loop over the whole array and multiply every value whose index is not `i`. It is correct by definition: it computes exactly what the problem asks for.

Time `O(n²)`, space `O(1)` beyond the output.

## Optimal: prefix products times suffix products

Look at what the brute force repeats. The answer for `i = 5` multiplies `nums[0..4]`, and the answer for `i = 6` multiplies `nums[0..5]`, which is the same work plus one more factor. The left half for each index is the previous left half times one number. The right half behaves the same way when you walk from the end.

So define:

- `left[i]` = product of `nums[0..i-1]` (and `1` for `i = 0`, the empty product).
- `right[i]` = product of `nums[i+1..n-1]` (and `1` for `i = n - 1`).

Then `answer[i] = left[i] * right[i]`. Two extra arrays give an `O(n)` time, `O(n)` space solution, and that is a perfectly good first version to say out loud.

To reach `O(1)` extra space, store the left products directly in the output and fold the right products in on the way back, keeping only a single running number:

1. Create `answer` of length `n`. Set `leftProduct = 1`.
2. For `i` from `0` to `n - 1`: write `answer[i] = leftProduct`, then `leftProduct *= nums[i]`.
3. Set `rightProduct = 1`.
4. For `i` from `n - 1` down to `0`: `answer[i] *= rightProduct`, then `rightProduct *= nums[i]`.
5. Return `answer`.

The order inside each loop is the whole trick. The invariant at the top of the forward loop is "`leftProduct` is the product of everything strictly before `i`". Using it before multiplying `nums[i]` in is what keeps `nums[i]` out of its own answer. The backward loop has the mirror invariant for "strictly after `i`".

## Walkthrough

`nums = [4, 2, 3, 5]`. Expected `[30, 60, 40, 24]`.

| pass | i | nums[i] | running before | answer[i] after | running after |
| --- | --- | --- | --- | --- | --- |
| left | 0 | 4 | 1 | 1 | 4 |
| left | 1 | 2 | 4 | 4 | 8 |
| left | 2 | 3 | 8 | 8 | 24 |
| left | 3 | 5 | 24 | 24 | 120 |
| right | 3 | 5 | 1 | 24 × 1 = 24 | 5 |
| right | 2 | 3 | 5 | 8 × 5 = 40 | 15 |
| right | 1 | 2 | 15 | 4 × 15 = 60 | 30 |
| right | 0 | 4 | 30 | 1 × 30 = 30 | 120 |

After the left pass the array holds only prefix products. Each entry is completed by exactly one multiplication in the right pass. Both running products end at `120`, the total, but neither loop ever uses the total.

## Complexity

- Brute force: time `O(n²)`, one full scan per index. Space `O(1)` extra.
- Prefix and suffix arrays: time `O(n)`, three linear passes. Space `O(n)` for the two helper arrays.
- Optimal: time `O(n)`, two passes with constant work per step. Space `O(1)` extra, since the output array doesn't count and only two numbers are kept.

## Edge cases

- Exactly two elements: each answer is the other element, for example `[-1, 2]` gives `[2, -1]`.
- One zero: every product that includes it is `0`, so only the zero's own position gets a non-zero value (the product of the rest).
- Two or more zeros: every position still sees at least one zero, so the whole answer is zeros. The prefix and suffix method handles both zero cases with no special code.
- Negative numbers: signs multiply through naturally, no special handling needed.
- Overflow: the constraints keep every prefix and suffix product inside 32 bits. In Java or C++ that guarantee is what lets you use `int`.

## Common mistakes

- Multiplying `nums[i]` into the running product **before** writing `answer[i]`, which includes the element in its own answer.
- Starting the running products at `0` instead of `1`, which zeroes everything.
- Using division and then patching zeros with special cases. It is banned here, and the zero logic (count the zeros, handle 0, 1, and 2 or more) is easy to get wrong under pressure.
- Running the backward loop to `i > 0` instead of `i >= 0`, which leaves `answer[0]` as the bare prefix `1`.

## In the interview

- Confirm the rules first: no division, the output array doesn't count towards space, and products fit in an integer.
- Give the brute force in one sentence, then: "Each answer is a prefix product times a suffix product. I can build both with running values." Write the two-array version if you want a safe start, then compress it into the output array.
- Likely follow-ups:
  - *Why not divide?* Banned, and with one zero the total is `0` so you can't recover the others. You'd have to count zeros and branch.
  - *Can you do it in one loop?* Yes. Walk `i` forward and `j = n - 1 - i` backward in the same loop, updating both running products. Same complexity, just harder to read.
  - *Sums instead of products?* Then subtraction is fine: `total - nums[i]`. Division is the problem, not the idea.
  - *Products might overflow?* Use 64-bit integers or `BigInt`, or work modulo a prime if the problem allows it.
