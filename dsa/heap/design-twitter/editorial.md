**Key idea:** store each user's posts in their own list in posting order, with a global counter as the timestamp. A news feed is a merge of several time-sorted lists, of which you only need the 10 newest items: put each source's newest post in a max-heap by time, pop the newest, and push that source's next older post. Stop after 10.

## Recognising the pattern

Combining several sorted sequences and taking the top few is the k-way merge from the [Heap](/problems/patterns/heap) sheet, the same mechanism as Merge k Sorted Lists, read from the newest end. Follow relationships are a simple map of sets.

## Simple version (shown below as the alternative)

Keep one global list of all posts. For a feed, scan it from the newest end and collect posts by the user or by someone they follow, until 10 are found. That is the reference brute force below. Posting is `O(1)`, but a feed can scan every post ever made when the user follows quiet accounts.

## Heap version

State:

- `time`: incremented on every post.
- For each user: their post times and tweet ids, oldest first.
- `following`: user → set of followees.

Operations:

1. **`postTweet`:** append `(time, tweetId)` to the user's lists and increment `time`.
2. **`follow` / `unfollow`:** add to or remove from the follower's set.
3. **`getNewsFeed(user)`:**
   1. Sources are the user and everyone they follow.
   2. For each source with posts, push `[time, tweetId, source, index]` for its newest post into a max-heap by time.
   3. While fewer than 10 posts are collected and the heap isn't empty: pop the newest, record its tweet id, and if that source has an older post, push it.

Each source contributes at most one entry at a time, so the heap holds at most `F + 1` entries for `F` followees.

## Walkthrough

| call | effect | feed |
| --- | --- | --- |
| postTweet(1, 5) | user 1 posts 5 at time 0 | |
| getNewsFeed(1) | heap: [0, 5] | [5] |
| follow(1, 2) | | |
| postTweet(2, 6) | user 2 posts 6 at time 1 | |
| getNewsFeed(1) | heap: user 1's [0, 5], user 2's [1, 6] → pop 6, then 5 | [6, 5] |
| unfollow(1, 2) | | |
| getNewsFeed(1) | only user 1's posts | [5] |

## Complexity

- Global list: post `O(1)`; feed `O(P)` for `P` total posts in the worst case.
- Heap merge: post `O(1)`; follow/unfollow `O(1)`; feed `O(F + 10 log F)` to seed the heap and pop up to 10 times.

## Edge cases

- Following yourself: your posts must not appear twice; skip yourself when adding followees.
- Unfollowing someone not followed: no effect.
- Fewer than 10 posts available: return what exists.

## Common mistakes

- Sorting all posts from all sources for each feed.
- Using tweet ids as timestamps; ids aren't ordered by time.
- Letting a user unfollow themselves and lose their own posts.

## In the interview

- Mention it is a k-way merge, then discuss scale: fan-out on write (push posts to followers' feeds) versus fan-out on read (merge at read time, as here), and the hybrid used for accounts with many followers.
- Likely follow-ups:
  - *Millions of followers?* Precompute feeds for most users, merge celebrities' posts at read time.
  - *Pagination?* Remember each source's index and continue the merge.
