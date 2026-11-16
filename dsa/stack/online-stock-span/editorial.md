**Key insight:** if today's price is at least the price on top of the stack, everything that day covered is covered by today too. Pop it and absorb its span — a monotonic stack of `[price, span]`.

## Approach

1. Keep a stack of `[price, span]` with prices strictly decreasing from bottom to top.
2. On `next(price)`: start `span = 1`; while the top price is `<= price`, pop and add its span.
3. Push `[price, span]` and return `span`.

Equivalently, store day indices and return `today - indexOfPreviousGreater` — the stack's top after popping is the previous strictly greater day.

## Complexity

- Amortised `O(1)` per call — each price is pushed once and popped at most once.
- Space `O(n)` in the worst case (falling prices).

## Alternatives to mention

- Brute force: store all prices and scan back each time — `O(n)` per call, `O(n²)` total.

## Pitfalls

- Using `<` instead of `<=`: equal prices count towards the span.
- Popping without accumulating spans, which loses the days the popped entry had already absorbed.
