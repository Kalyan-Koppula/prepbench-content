class Twitter {
  time = 0
  posts = new Map<number, [number, number][]>() // userId -> [time, tweetId] in posting order
  following = new Map<number, Set<number>>()

  postTweet(userId: number, tweetId: number): void {
    if (!this.posts.has(userId)) this.posts.set(userId, [])
    this.posts.get(userId)!.push([this.time++, tweetId])
  }

  getNewsFeed(userId: number): number[] {
    const sources = new Set(this.following.get(userId) ?? [])
    sources.add(userId)

    // Max-heap of [time, tweetId, userId, index into that user's posts].
    const heap = new PriorityQueue<[number, number, number, number]>((a, b) => b[0] - a[0])
    for (const u of sources) {
      const list = this.posts.get(u)
      if (list?.length) {
        const i = list.length - 1
        heap.push([list[i][0], list[i][1], u, i])
      }
    }

    const feed: number[] = []
    while (feed.length < 10 && !heap.isEmpty()) {
      const [, tweetId, u, i] = heap.pop()!
      feed.push(tweetId)
      if (i > 0) {
        const [t, id] = this.posts.get(u)![i - 1]
        heap.push([t, id, u, i - 1])
      }
    }
    return feed
  }

  follow(followerId: number, followeeId: number): void {
    if (!this.following.has(followerId)) this.following.set(followerId, new Set())
    this.following.get(followerId)!.add(followeeId)
  }

  unfollow(followerId: number, followeeId: number): void {
    this.following.get(followerId)?.delete(followeeId)
  }
}
