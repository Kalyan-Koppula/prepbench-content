class Twitter {
  // One global list of posts; the feed scans it from the newest end.
  authors: number[]
  tweetIds: number[]
  following: Map<number, Set<number>>

  constructor() {
    this.authors = []
    this.tweetIds = []
    this.following = new Map()
  }

  postTweet(userId: number, tweetId: number): void {
    this.authors.push(userId)
    this.tweetIds.push(tweetId)
  }

  getNewsFeed(userId: number): number[] {
    const followed = this.following.get(userId)
    const feed: number[] = []
    for (let i = this.authors.length - 1; i >= 0 && feed.length < 10; i--) {
      const author = this.authors[i]
      if (author === userId || (followed !== undefined && followed.has(author))) {
        feed.push(this.tweetIds[i])
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
