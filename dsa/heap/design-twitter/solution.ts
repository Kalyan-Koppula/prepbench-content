class Twitter {
  time: number
  postTimes: Map<number, number[]> // userId -> post times, oldest first
  postIds: Map<number, number[]> // userId -> tweet ids, same order
  following: Map<number, Set<number>>

  constructor() {
    this.time = 0
    this.postTimes = new Map()
    this.postIds = new Map()
    this.following = new Map()
  }

  postTweet(userId: number, tweetId: number): void {
    let times = this.postTimes.get(userId)
    let ids = this.postIds.get(userId)
    if (times === undefined || ids === undefined) {
      times = []
      ids = []
      this.postTimes.set(userId, times)
      this.postIds.set(userId, ids)
    }
    times.push(this.time)
    ids.push(tweetId)
    this.time++
  }

  getNewsFeed(userId: number): number[] {
    const sources: number[] = [userId]
    const followed = this.following.get(userId)
    if (followed !== undefined) {
      for (const other of followed) {
        if (other !== userId) {
          sources.push(other)
        }
      }
    }
    // Heap entries are [time, tweetId, userId, index]: one per source,
    // pointing at that user's newest post not yet taken. Newest time first.
    const heap = new PriorityQueue<number[]>((a, b) => b[0] - a[0])
    for (let s = 0; s < sources.length; s++) {
      const times = this.postTimes.get(sources[s])
      const ids = this.postIds.get(sources[s])
      if (times !== undefined && ids !== undefined && times.length > 0) {
        const i = times.length - 1
        heap.push([times[i], ids[i], sources[s], i])
      }
    }
    const feed: number[] = []
    while (feed.length < 10 && !heap.isEmpty()) {
      const top = heap.pop() as number[]
      feed.push(top[1])
      const user = top[2]
      const i = top[3]
      if (i > 0) {
        // Replace it with that user's next older post.
        const times = this.postTimes.get(user) as number[]
        const ids = this.postIds.get(user) as number[]
        heap.push([times[i - 1], ids[i - 1], user, i - 1])
      }
    }
    return feed
  }

  follow(followerId: number, followeeId: number): void {
    let set = this.following.get(followerId)
    if (set === undefined) {
      set = new Set()
      this.following.set(followerId, set)
    }
    set.add(followeeId)
  }

  unfollow(followerId: number, followeeId: number): void {
    const set = this.following.get(followerId)
    if (set !== undefined) {
      set.delete(followeeId)
    }
  }
}
