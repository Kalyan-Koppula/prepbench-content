---
title: Design Twitter
difficulty: Medium
order: 7
lists: [neetcode150]
tags: [heap, design, hash-map, k-way-merge]
leetcode: design-twitter
kind: class
class: Twitter
params: []
methods:
  - name: postTweet
    params: [{ name: userId, type: number }, { name: tweetId, type: number }]
    returns: void
  - name: getNewsFeed
    params: [{ name: userId, type: number }]
    returns: "number[]"
  - name: follow
    params: [{ name: followerId, type: number }, { name: followeeId, type: number }]
    returns: void
  - name: unfollow
    params: [{ name: followerId, type: number }, { name: followeeId, type: number }]
    returns: void
hints:
  - Give every post a global timestamp, and store each user's posts in the order they were made.
  - Each followed user's post list is already sorted by time. The feed is the first 10 items of a k-way merge of those lists — a max-heap holding one "next post" per user does that.
complexity: { time: "O(F + 10 log F) per feed, O(1) otherwise", space: "O(users + posts + follows)" }
---

Design a tiny social feed.

- `postTweet(userId, tweetId)` records a new post with id `tweetId` by `userId`. Every call uses a fresh `tweetId`.
- `getNewsFeed(userId)` returns the ids of the **10 most recent** posts made by `userId` or by anyone `userId` follows, newest first (fewer if there aren't 10).
- `follow(followerId, followeeId)` makes `followerId` follow `followeeId`.
- `unfollow(followerId, followeeId)` undoes that. Unfollowing someone you don't follow does nothing.

A user always sees their own posts; following yourself has no extra effect. "Recent" means the order of `postTweet` calls.

Tests are a sequence of operations: the first creates the object, and the output lists each call's return value (`null` for the constructor and methods that return nothing).

## Constraints

- `1 <= userId, followerId, followeeId <= 500`
- `0 <= tweetId <= 10^4`, and all tweet ids are distinct.
- At most `3 * 10^4` calls in total.
