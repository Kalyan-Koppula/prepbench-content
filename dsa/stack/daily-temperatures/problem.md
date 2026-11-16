---
title: Daily Temperatures
difficulty: Medium
order: 5
lists: [neetcode150]
tags: [monotonic-stack]
leetcode: daily-temperatures
function: dailyTemperatures
params:
  - { name: temperatures, type: "number[]" }
returns: "number[]"
hints:
  - For each day you need the index of the next strictly warmer day — a "next greater element" question.
  - Keep a stack of days still waiting for a warmer day. When today is warmer than the day on top, that day's wait is over.
complexity: { time: "O(n)", space: "O(n)" }
---

`temperatures[i]` is the temperature on day `i`. For each day, find how many days you'd have to wait for a **strictly warmer** day.

Return an array `answer` where `answer[i]` is that number of days, or `0` if no later day is warmer.

## Constraints

- `1 <= temperatures.length <= 10^5`
- `30 <= temperatures[i] <= 100`
