---
title: Promise.any
difficulty: Medium
order: 3
tags: [promises, polyfill, errors]
frequency: medium
exports: [promiseAny]
hints:
  - The first fulfilment wins immediately; rejections only matter once every input has rejected.
  - Count rejections and store each reason at its input index.
  - When the count reaches the number of inputs, reject with `new AggregateError(errors, message)`.
---

Implement `promiseAny(iterable)`, which behaves like `Promise.any` without calling it.

- It fulfils with the value of the **first input to fulfil**, as soon as that happens.
- Rejections are ignored while any input could still fulfil.
- If **every** input rejects, it rejects with an `AggregateError` whose `errors` array holds the rejection reasons **in input order** (not the order they rejected in).

```js
promiseAny([
  fetchFrom('eu-mirror'),  // rejects after 40ms
  fetchFrom('us-mirror'),  // fulfils after 90ms with 'payload'
]).then(console.log)       // after 90ms: 'payload'
```

## Notes

- Accept any iterable. Plain values count as fulfilled; thenables must be adopted.
- An empty iterable rejects with an `AggregateError` whose `errors` is `[]` (asynchronously; never throw).
- Use the built-in `AggregateError` constructor: `new AggregateError(errors, message)`. Any message is fine.
