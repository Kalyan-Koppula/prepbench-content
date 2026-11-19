**Key idea:** add each symbol's value, except when a symbol is **smaller than the one after it**: then it is part of a subtractive pair (`IV`, `IX`, `XL`, `XC`, `CD`, `CM`) and is subtracted instead. One left-to-right pass with a one-character look-ahead.

## Recognising the pattern

Parsing a small notation with one look-ahead is a scanning problem from the [Strings](/problems/patterns/strings) sheet. The rule about a smaller symbol before a larger one replaces a list of six special cases.

## Alternative: match two-letter forms first (shown below)

At each position, check whether the next two characters are one of the six subtractive forms; if so, add its value and skip two, otherwise add the single symbol. That is the reference brute force below. Same `O(n)`, more table entries.

## One pass with look-ahead

1. `total = 0`.
2. For each `i`: `current = value(s[i])`.
   - If `i + 1 < n` and `value(s[i + 1]) > current`: `total −= current`.
   - Otherwise: `total += current`.
3. Return `total`.

`value` is a `switch` (or a small map) from the seven symbols to 1, 5, 10, 50, 100, 500, 1000.

**Why subtracting works.** `IV` is `5 − 1`. Subtracting the `I` when you see it and then adding the `V` gives the same 4 without treating the pair specially.

## Walkthrough

`s = "CDXLIV"`

| i | symbol | next | action | total |
| --- | --- | --- | --- | --- |
| 0 | C (100) | D (500) | subtract | −100 |
| 1 | D (500) | X | add | 400 |
| 2 | X (10) | L (50) | subtract | 390 |
| 3 | L (50) | I | add | 440 |
| 4 | I (1) | V (5) | subtract | 439 |
| 5 | V (5) | – | add | 444 |

Answer `444`.

## Complexity

- Both versions: `O(n)` time, `O(1)` space (the symbol table has a fixed size).

## Edge cases

- A single symbol: its value.
- Repeated symbols (`III`, `MMM`): all added.
- The largest value, `MMMCMXCIX` (3999): several subtractive pairs.

## Common mistakes

- Comparing with the **previous** symbol and forgetting to undo the earlier addition.
- Reading `s[i + 1]` past the end of the string.
- Hard-coding every two-letter pair and missing one.

## In the interview

- State the "smaller before larger" rule; it is the whole solution.
- Likely follow-ups:
  - *Integer to Roman?* Greedily subtract the largest value from a 13-entry table (including the six subtractive forms), appending its symbol each time.
  - *Validate a Roman numeral?* Add rules about which symbols may repeat and which pairs are allowed.
