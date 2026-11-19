**Key idea:** count how often each value occurs, then group values by their count. Because no count can exceed `n`, an array of `n + 1` buckets indexed by count replaces sorting, and walking the buckets from the top yields the `k` most frequent values in linear time.

## Recognising the pattern

There are two steps: **frequency counting** with a hash map, then **selecting the top `k`** by frequency. Counting is the bread-and-butter move of the [Arrays & Hashing](/problems/patterns/arrays-hashing) sheet. For the selection step there are three standard tools: sort, a heap of size `k`, or bucket sort when the keys are small integers. Here the keys are counts between 1 and `n`, which is exactly when bucket sort shines.

## Brute force

Count each distinct value by scanning a list of values seen so far. Then do `k` rounds; each round picks the value with the highest count that hasn't been taken yet.

It is correct because each round takes the next most frequent value. Time `O(n · d + k · d)` where `d` is the number of distinct values, which is `O(n²)` when most values are distinct. Space `O(d)`.

## Better: count, then sort or use a heap

- Count with a hash map in `O(n)`. Sort the distinct values by count, descending, and take the first `k`. Time `O(n + d log d)`.
- Or keep a min-heap of size `k` keyed by count. Push each value, and pop when the heap grows past `k`. What remains are the `k` largest. Time `O(n + d log k)`, which is better when `k` is small.

## Optimal: bucket by count

The sort compares counts against each other, but counts are integers in a small, known range: `1 .. n`. So put each value directly into the slot for its count.

1. Count occurrences into a map `freq`.
2. Create `n + 1` empty buckets. For each `(value, count)` in `freq`, push `value` into `buckets[count]`.
3. Walk `f` from `n` down to `1`, collecting values from `buckets[f]` until you have `k`.
4. Return the collected values.

The uniqueness guarantee in the statement means you never have to break a tie at the boundary.

## Walkthrough

`nums = [4, 4, 4, 6, 6, 2]`, `k = 2`

Counts: `4 → 3`, `6 → 2`, `2 → 1`.

| bucket (count) | values |
| --- | --- |
| 3 | [4] |
| 2 | [6] |
| 1 | [2] |

Walking down from 6: buckets 6, 5 and 4 are empty, bucket 3 gives `4`, bucket 2 gives `6`. Two values collected, so return `[4, 6]`.

## Complexity

- Brute force: time `O(n · d)` up to `O(n²)`, space `O(d)`.
- Sort by count: time `O(n + d log d)`, space `O(d)`.
- Heap of size `k`: time `O(n + d log k)`, space `O(d + k)`.
- Buckets: time `O(n)`: counting is `O(n)`, filling buckets is `O(d)`, and the walk visits at most `n + 1` buckets. Space `O(n)`.

## Edge cases

- `k` equal to the number of distinct values: every value is returned.
- One distinct value repeated `n` times: it sits in bucket `n`, the first one checked.
- Negative values: they are map keys like any other.
- Many values with the same count: they share a bucket, and the guarantee ensures the cut never falls inside a tie.

## Common mistakes

- Sizing the bucket array as `n` instead of `n + 1`, so a value that occurs `n` times indexes past the end.
- Building the buckets as one shared array (`new Array(n + 1).fill([])`), which makes every bucket the same list.
- Forgetting to stop once `k` values are collected, and returning too many from the last bucket.

## In the interview

- Ask what happens on ties at the `k`-th position. Here the input rules them out; in general you would need a tie-break rule.
- Give the sort solution first, then: "Counts are bounded by `n`, so I can bucket instead of sort." Mention the heap as the choice when the data is a stream.
- Likely follow-ups:
  - *Input arrives as a stream?* Keep a count map plus a min-heap of size `k`.
  - *Top `k` frequent words, ties broken alphabetically?* Use a heap or sort with a two-part comparison: count descending, then word ascending.
  - *Average `O(n)` without extra buckets?* Quickselect on the distinct values by count.
