**Key insight:** the matcher is a tiny regular-expression engine with two wildcards. `*` is "consume one word"; `#` is a choice between "stop here" and "consume one more word and stay on `#`", which plain recursion explores for you.

## Approach

1. Store subscriptions as `{ words: pattern.split('.'), handler }` in an array; `subscribe` returns a closure that filters out that exact object.
2. `match(pattern, topic, i, j)`:
   - pattern exhausted: match only if the topic is exhausted too;
   - `#`: `match(i + 1, j) || (j < topic.length && match(i, j + 1))`;
   - topic exhausted: no match;
   - `*` or equal word: `match(i + 1, j + 1)`.
3. `publish` splits the topic, loops over a copy of the subscriptions, calls matching handlers and counts them.

## Walkthrough

Subscriptions: `orders.*`, `orders.#`, `#.failed`. Publishing `orders.eu.failed`:

| Pattern | Rule | Match? |
| --- | --- | --- |
| `orders.*` | `*` matches exactly one word; the topic has three | no |
| `orders.#` | `#` matches zero or more words | yes |
| `#.failed` | `#` absorbs `orders.eu`, then `failed` | yes |

The matcher is a small recursive function: for `#`, either skip it (match zero words) or consume one topic word and stay on `#`. `publish` returns the number of handlers called.

## Complexity

Matching is `O(p × t)` per subscription in the worst case with memoisation, usually much less; publishing checks every subscription (a trie of patterns scales better).

## Edge cases to test

- Exact topics, `*` and `#` in several positions.
- `#` matching zero words (`orders.#` matches `orders`).
- Unsubscribing during publish.
- Handler receives the data and the actual topic.

## Pitfalls

- Converting patterns to a regex with `#` -> `.*` and `*` -> `[^.]+` almost works, but `user.#` then needs the dot before `#` to be optional (`user` must match), and escaping the rest of the pattern is easy to get wrong.
- `topic.startsWith(prefix)` for `user.#` also matches `users.created`.
- Treating `#` as "one or more" makes `user.#` miss plain `user`.
- Iterating the live array lets a handler that subscribes cause an endless publish.

## Follow-ups interviewers add

- **Performance with thousands of patterns:** build a trie keyed by pattern word, with `*` and `#` children, and walk it with the topic instead of testing every pattern.
- **Memoise** the matcher by `(pattern, topic)`, or cache results per topic.
- **Retained messages:** a new subscriber immediately receives the last message on each matching topic (MQTT-style).
- **Async delivery** with `queueMicrotask` so a slow handler doesn't block the publisher, and what that does to error handling.

## In the interview

These are AMQP/RabbitMQ topic semantics; mentioning that shows context. For large numbers of subscriptions, describe a trie keyed by words with wildcard branches.
