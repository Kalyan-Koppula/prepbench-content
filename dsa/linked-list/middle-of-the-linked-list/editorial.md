**Key insight:** a fast pointer moving two steps for every one step of a slow pointer covers the list twice as fast — when it falls off the end, the slow pointer is halfway.

## Approach

1. `slow = fast = head`.
2. While `fast` and `fast.next` both exist: `slow = slow.next`, `fast = fast.next.next`.
3. Return `slow`.

With the loop condition `fast && fast.next`, an even-length list stops with `slow` on the **second** middle. For the first middle (needed when splitting a list in half, e.g. Sort List), loop while `fast.next && fast.next.next` instead.

## Complexity

- Time `O(n)`, space `O(1)`.

## Alternatives to mention

- Two passes: count `n`, then walk `⌊n / 2⌋` steps. Same complexity; the one-pass version is the expected answer.
- Copy nodes into an array and index the middle: `O(n)` extra space.

## Pitfalls

- Checking only `fast.next` and then reading `fast.next.next` on a `null` fast.
- Mixing up which middle the problem wants — state your choice and the loop condition that gives it.
