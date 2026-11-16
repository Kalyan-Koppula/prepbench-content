**Key insight:** scan from the right, skip spaces, and cut out each word between two pointers. Words come out already in reverse order, and joining them with single spaces normalises the spacing.

## Approach

1. `i = n - 1`. Loop:
   - Move `i` left past spaces. If `i < 0`, stop.
   - Set `end = i + 1`, then move `i` left while `s[i]` isn't a space. The word is `s.slice(i + 1, end)`.
   - Push it to `words`.
2. Return `words.join(' ')`.

## Complexity

- Time `O(n)` — each character is visited once.
- Space `O(n)` — the words and the output (JS strings are immutable, so any answer allocates).

## Alternatives to mention

- `s.trim().split(/\s+/).reverse().join(' ')` — idiomatic, correct, also `O(n)`. Write it if the interviewer allows built-ins, but expect "now without split".
- In-place follow-up (mutable char array, as in C++): reverse the whole array, reverse each word back, then compact spaces with a read/write pointer. `O(1)` extra space.

## Pitfalls

- `s.split(' ')` leaves empty strings for repeated spaces, producing double spaces in the output.
- Don't forget leading/trailing spaces.
