**Key insight:** always run the available task type with the most copies left — the most frequent type is the bottleneck, so you want to spread it out as early as possible. A max-heap of counts and a FIFO queue of cooling types simulate this greedy.

## Approach

1. Count each label; push the counts into a max-heap.
2. Each time unit, pop the largest count, run one copy, and if copies remain put `[count - 1, time + n]` into a cooldown queue.
3. When the queue's front becomes available at the current `time`, push it back into the heap.
4. If the heap is empty but the queue isn't, the CPU idles — jump `time` straight to the front's ready time instead of ticking one unit at a time.

The queue stays sorted by ready time automatically, because every entry gets `time + n` with an increasing `time`.

## Complexity

- Time `O(T log 26)` = `O(T)` for `T` tasks: at most 26 distinct counts live in the heap.
- Space `O(26)`.

## Alternatives to mention

- **Closed form:** let `maxCount` be the highest frequency and `tied` the number of labels with that frequency. The answer is `max(T, (maxCount - 1) * (n + 1) + tied)`. The frame of `maxCount - 1` blocks of size `n + 1` is forced by the most frequent label; if there are more tasks than idle slots, no idling is needed at all and the answer is just `T`. `O(T)` time — the best answer, but be ready to justify it.

## Pitfalls

- Forgetting the `max(T, ...)` in the formula: with many distinct labels the frame overflows and the answer is just the task count.
- The cooldown is `n` units *between* runs, so a task run at time `t` is next available at `t + n + 1` (in 0-indexed ticks).
