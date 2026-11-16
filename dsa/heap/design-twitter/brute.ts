class Twitter {
  all: [number, number][] = [] // [userId, tweetId] in posting order
  edges = new Set<string>()

  postTweet(userId: number, tweetId: number): void {
    this.all.push([userId, tweetId])
  }

  getNewsFeed(userId: number): number[] {
    const feed: number[] = []
    for (let i = this.all.length - 1; i >= 0 && feed.length < 10; i--) {
      const [author, id] = this.all[i]
      if (author === userId || this.edges.has(`${userId}>${author}`)) feed.push(id)
    }
    return feed
  }

  follow(followerId: number, followeeId: number): void {
    this.edges.add(`${followerId}>${followeeId}`)
  }

  unfollow(followerId: number, followeeId: number): void {
    this.edges.delete(`${followerId}>${followeeId}`)
  }
}
