**Key idea:** you don't need to generate permutations to find the kth one. In sorted order, the first `(n − 1)!` permutations start with the smallest digit, the next `(n − 1)!` with the second smallest, and so on. Dividing the 0-based rank by `(n − 1)!` tells you the first digit directly; the remainder is the rank within that block. Repeat with one digit fewer.

## Recognising the pattern

This sits in the [Backtracking](/problems/patterns/backtracking) sheet as the case where you **count** subtrees instead of exploring them. Knowing how many leaves each branch has lets you jump straight to the right branch, a trick that turns `O(n!)` enumeration into `O(n²)` construction.

## Brute force

Start from `1 2 … n` and apply "next permutation" `k − 1` times. That is the reference brute force below. Correct, but `O(k · n)`, which for `n = 9` can be over 3 million steps. (Generating all `n!` permutations and sorting them is far worse.)

## Optimal: the factorial number system

1. `digits = [1, 2, …, n]`, `rank = k − 1`.
2. For `remaining` from `n` down to 1:
   1. `block = (remaining − 1)!`, the number of permutations per choice of the next digit.
   2. `index = floor(rank / block)`. The next digit is `digits[index]`.
   3. Append it and remove it from `digits`.
   4. `rank = rank % block`.
3. Return the built string.

Using a 0-based rank makes the division line up: rank 0 is the first permutation, in block 0.

## Walkthrough

`n = 4`, `k = 9`, so `rank = 8`. Factorials: `3! = 6`, `2! = 2`, `1! = 1`.

| remaining | digits | block | index = rank / block | pick | rank after |
| --- | --- | --- | --- | --- | --- |
| 4 | 1 2 3 4 | 6 | 8 / 6 = 1 | 2 | 8 % 6 = 2 |
| 3 | 1 3 4 | 2 | 2 / 2 = 1 | 3 | 0 |
| 2 | 1 4 | 1 | 0 | 1 | 0 |
| 1 | 4 | 1 | 0 | 4 | 0 |

Answer `"2314"`: the 9th permutation of 1–4.

## Complexity

- Repeated next permutation: time `O(k · n)`, space `O(n)`.
- Factorial construction: time `O(n²)` (removing from the list is `O(n)`, done `n` times). Space `O(n)`.

## Edge cases

- `k = 1`: the digits in increasing order.
- `k = n!`: the digits in decreasing order.
- `n = 1`: `"1"`.

## Common mistakes

- Using `k` instead of `k − 1`, which shifts every answer by one block.
- Forgetting to remove the chosen digit.
- Using the block size `remaining!` instead of `(remaining − 1)!`.

## In the interview

- Show the block structure on `n = 3` (two permutations start with each digit), then generalise.
- Likely follow-ups:
  - *The rank of a given permutation?* The reverse process: for each position, count unused smaller digits and multiply by the factorial.
  - *Repeated digits?* Blocks are counted with multinomial coefficients instead of factorials.
