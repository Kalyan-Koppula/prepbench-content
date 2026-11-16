**Key insight:** a symbol is subtracted exactly when the next symbol is larger; otherwise it's added. No need to special-case the six pairs.

## Approach

1. Map each symbol to its value.
2. For each index `i`, let `v = value(s[i])`. If `i + 1 < n` and `value(s[i + 1]) > v`, subtract `v`; otherwise add it.
3. Return the total.

Check: `MCMXC` → `+1000 −100 +1000 −10 +100 = 1990`.

## Complexity

- Time `O(n)`, space `O(1)` (seven-entry table).

## Alternatives to mention

- Scan right to left, keeping the previous value: subtract when the current value is smaller than the previous one. Equivalent.
- Replace the six subtractive pairs with placeholder symbols, then sum — works but clunky.

## Follow-ups

- Integer → Roman: greedily take the largest value from a 13-entry table (including the six pairs) while it fits.
- Validation is out of scope here (the input is guaranteed valid); interviewers sometimes ask what would make `IIII` or `IC` invalid.
