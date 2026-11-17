**Key insight:** the matcher is a tiny regular-expression engine with two wildcards. `*` is "consume one word"; `#` is a choice between "stop here" and "consume one more word and stay on `#`", which plain recursion explores for you.

## Approach

1. Store subscriptions as `{ words: pattern.split('.'), handler }` in an array; `subscribe` returns a closure that filters out that exact object.
2. `match(pattern, topic, i, j)`:
   - pattern exhausted: match only if the topic is exhausted too;
   - `#`: `match(i + 1, j) || (j < topic.length && match(i, j + 1))`;
   - topic exhausted: no match;
   - `*` or equal word: `match(i + 1, j + 1)`.
3. `publish` splits the topic, loops over a copy of the subscriptions, calls matching handlers and counts them.

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
