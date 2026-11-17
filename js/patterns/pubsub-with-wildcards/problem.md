---
title: Pub/Sub with Wildcards
difficulty: Medium
order: 3
tags: [classes, recursion, strings]
frequency: low
exports: [PubSub]
hints:
  - Split both the pattern and the topic on `.` and compare them word by word.
  - "`*` consumes exactly one topic word. `#` can consume zero words or one more word and stay put: try both."
  - Publish to a snapshot of the subscriptions.
---

Implement a `PubSub` broker where subscribers listen to **topic patterns**, like an AMQP topic exchange or an analytics event bus.

```js
const bus = new PubSub()
bus.subscribe('user.*', (data, topic) => console.log('one level:', topic))
bus.subscribe('user.#', (data, topic) => console.log('any depth:', topic))

bus.publish('user.created', { id: 1 })        // both handlers -> returns 2
bus.publish('user.profile.updated', { id: 1 }) // only 'user.#' -> returns 1
bus.publish('order.created', {})               // nobody        -> returns 0
```

## Notes

A topic is a list of non-empty words joined by `.`. Topics never contain wildcards. A pattern is matched word by word:

| Pattern word | Matches |
|---|---|
| a literal, e.g. `user` | exactly that topic word |
| `*` | exactly **one** topic word |
| `#` | **zero or more** topic words |

So `user.*` matches `user.created` but not `user` or `user.profile.updated`; `user.#` matches `user`, `user.created` and `user.profile.updated`; `user.#.updated` matches `user.updated` and `user.a.b.updated`; `#` matches every topic. Words are compared exactly: `user` does not match `users`, and nothing matches a prefix of a word.

- `subscribe(pattern, handler)` returns a function that removes that subscription.
- `publish(topic, data)` calls `handler(data, topic)` for every matching subscription, in subscription order, and returns how many handlers it called. Two subscriptions with the same handler are two calls.
- Subscriptions added while a publish is running are not called by that publish.
