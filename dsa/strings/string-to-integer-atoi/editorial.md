**Key idea:** parse in fixed stages: skip leading spaces, read an optional sign, then read digits until the first non-digit. While reading digits, check **before** each `value · 10 + digit` whether it would exceed the 32-bit range, and clamp to the limit if so.

## Recognising the pattern

Parsing input with a strict sequence of rules is a state-by-state scan, from the [Strings](/problems/patterns/strings) sheet. The overflow guard is the same one used in [Reverse Integer](/problems/reverse-integer).

## Alternative: collect the digits first (shown below)

Collect the digit run as a string, dropping leading zeros. More than 10 significant digits always overflows, so clamp; otherwise convert in a wide type (10 digits fit easily in 64 bits) and clamp once. That is the reference brute force below. Same `O(n)` time, with the range check in one place.

## Staged parsing with a guard

1. Skip spaces.
2. If the next character is `+` or `−`, record the sign and move on.
3. While the character is a digit `d`:
   - If `value > (INT_MAX − d) / 10` (integer division), return `INT_MAX` for a positive sign or `INT_MIN` for a negative one.
   - Otherwise `value = value · 10 + d`.
4. Return `sign · value`.

**Why one guard covers both signs.** The positive limit is `2147483647` and the negative one is `−2147483648`, one further. Any digit sequence that pushes `value` past `2147483647` is either exactly `2147483648` (which with a minus sign is `INT_MIN`) or larger (which clamps to `INT_MIN` anyway). So clamping to `INT_MIN` whenever the guard fires for a negative number is always right.

**What stops parsing.** Anything that isn't a digit after the sign: a letter, a space, a second sign, a decimal point. Characters after that are ignored.

## Walkthrough

`s = "   -0042abc"`

| stage | characters | state |
| --- | --- | --- |
| spaces | 3 skipped | – |
| sign | `-` | sign = −1 |
| digits | 0, 0, 4, 2 | value 0, 0, 4, 42 |
| stop | `a` | – |

Answer `−42`. For `"99999999999"`, the guard fires at the tenth digit (`value = 999999999 > (2147483647 − 9) / 10`), so the answer is `2147483647`.

## Complexity

- Both versions: `O(n)` time, `O(1)` extra space for the guard version.

## Edge cases

- Empty string or only spaces: 0.
- A sign with no digits (`"+"`, `"-abc"`): 0.
- Letters before digits (`"words 99"`): 0.
- Leading zeros: harmless.
- `"-2147483648"`: exactly `INT_MIN`, returned via the clamp.

## Common mistakes

- Accumulating in a 32-bit integer and checking for overflow afterwards.
- Skipping all whitespace characters when the problem says only spaces (or the reverse); read the rules.
- Accepting a second sign or a sign after spaces in the middle.

## In the interview

- List the stages before coding; most bugs come from mixing them.
- Likely follow-ups:
  - *Valid Number?* A full state machine with decimals and exponents.
  - *Other bases?* Replace 10 with the base and map letters to digit values.
