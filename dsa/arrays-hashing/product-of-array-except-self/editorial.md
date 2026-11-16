**Key insight:** `answer[i] = left[i] * right[i]`, where `left[i]` is the product of everything before `i` and `right[i]` of everything after. Both are running products, so you never need division.

## Approach

1. Forward pass: `answer[i] = running` then `running *= nums[i]`, starting from `running = 1`. Now `answer[i]` holds the prefix product.
2. Backward pass with a fresh `running = 1`: `answer[i] *= running` then `running *= nums[i]`.
3. Each entry now has prefix × suffix.

## Complexity

- Time `O(n)` — two passes.
- Space `O(1)` beyond the output array.

## Alternatives to mention

- Brute force: multiply everything except `i` for every `i` — `O(n²)`.
- Separate `left` and `right` arrays: same time, `O(n)` extra space. A good first version before compressing into the output.
- Division (total product / `nums[i]`) is banned, and breaks on zeros anyway: one zero means only that index is non-zero; two zeros mean everything is zero. Interviewers like to ask about this.
