**Key insight:** each user's posts are already sorted by time, so the feed is the top 10 of a **k-way merge** over the user and everyone they follow. A max-heap seeded with each source's newest post produces them in order.

## Approach

1. Keep a global counter `time`; `postTweet` appends `[time++, tweetId]` to the author's list.
2. `following: Map<user, Set<user>>` makes `follow`/`unfollow` O(1).
3. `getNewsFeed(u)`:
   - Sources are `u` plus everyone `u` follows (a set, so self-follow doesn't double count).
   - Push each source's **latest** post with a pointer to its index.
   - Pop up to 10 times; after popping a post from user `v` at index `i`, push `v`'s post at `i - 1`.

## Complexity

- `postTweet`, `follow`, `unfollow`: `O(1)`.
- `getNewsFeed`: `O(F + 10 log F)` for `F` followed users — `O(F)` to seed the heap (or `O(F log F)` pushing one by one), then at most 10 pops.
- Space `O(users + posts + follows)`.

## Alternatives to mention

- Scan a single global list of posts backwards, filtering by author: simple, but `O(total posts)` per feed in the worst case.
- Gather every followed user's last 10 posts, sort, take 10: `O(10F log(10F))` — fine in practice and easy to code.
- Production systems precompute feeds on write ("fan-out on write") for normal users and merge on read for celebrities — a good talking point if the interviewer steers toward system design.

## Pitfalls

- Including the user's own posts even when they follow nobody.
- Following yourself, then unfollowing yourself, must not hide your own posts — always add `u` to the sources separately.
- Unfollowing someone you never followed must not throw.
