**Key idea:** today's span reaches back over every earlier day priced at most today's price. Keep a stack of `(price, span)` with prices strictly decreasing. When a new price arrives, pop every entry whose price is not higher and add its span to today's: today now covers those days too.

## Recognising the pattern

"How far back until something bigger" is a **previous greater element** question, the mirror of next greater, and it is solved with a monotonic stack from the [Stack](/problems/patterns/stack) sheet. The online setting (one price at a time) suits a stack perfectly, since it only ever looks at its top.

## Brute force

Store all prices. For each new price, walk backwards while earlier prices are less than or equal to it, counting the days. That is the reference brute force below.

Correct by definition. Each call is `O(n)` in the worst case (for rising prices), so `n` calls cost `O(n²)`. Space `O(n)`.

## Optimal: stack of (price, span)

1. Keep two parallel stacks, `prices` and `spans`, with prices strictly decreasing from bottom to top.
2. `next(price)`:
   1. `span = 1` for today.
   2. While the top price is `<= price`: add the top span to `span`, and pop both stacks.
   3. Push `price` and `span`. Return `span`.

**Why merging is safe.** If an earlier day's price is `<=` today's, then any future day that reaches back past today would also pass over that earlier day and everything it covered. So the earlier entry never needs to be looked at on its own again, and its span can be folded into today's.

**Amortised `O(1)`.** Each price is pushed once and popped at most once over the whole sequence, so `n` calls cost `O(n)` in total, even though a single call can pop many entries.

## Walkthrough

Prices: 100, 80, 60, 70, 60, 75, 85.

| price | popped (price, span) | span | stack after (price, span) |
| --- | --- | --- | --- |
| 100 | – | 1 | (100,1) |
| 80 | – | 1 | (100,1) (80,1) |
| 60 | – | 1 | (100,1) (80,1) (60,1) |
| 70 | (60,1) | 2 | (100,1) (80,1) (70,2) |
| 60 | – | 1 | … (70,2) (60,1) |
| 75 | (60,1) (70,2) | 4 | (100,1) (80,1) (75,4) |
| 85 | (75,4) (80,1) | 6 | (100,1) (85,6) |

Outputs: 1, 1, 1, 2, 1, 4, 6.

## Complexity

- Brute force: `O(n)` per call, `O(n²)` total. Space `O(n)`.
- Stack: amortised `O(1)` per call, `O(n)` total. Space `O(n)` in the worst case (falling prices).

## Edge cases

- Rising prices: every call empties the stack except the bottom, and the span keeps growing.
- Falling prices: every span is 1 and the stack keeps growing.
- Equal prices: "less than or equal" means an equal price is absorbed, so the comparison is `<=`.

## Common mistakes

- Popping only on strictly smaller prices, which undercounts equal days.
- Storing just prices and recounting the covered days, which brings back the quadratic cost.
- Storing indices without a running day counter; that works too, but then the span is `today - index of the previous greater price`, and you need the day number.

## In the interview

- Recognise it as "previous greater element" and explain why a stack fits an online stream.
- Mention the amortised argument explicitly.
- Likely follow-ups:
  - *Index-based version?* Keep a day counter and push `(price, day)`; the span is `day − top day` after popping, or `day + 1` if the stack is empty.
  - *Span over a fixed window only?* Add a deque-style expiry from the bottom.
