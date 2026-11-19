function minDistance(word1: string, word2: string): number {
  const m = word1.length
  const n = word2.length
  // dist[i][j] = fewest edits to turn the first i characters of word1
  // into the first j characters of word2.
  const dist: number[][] = []
  for (let i = 0; i <= m; i++) {
    dist.push(new Array(n + 1).fill(0))
  }
  for (let i = 0; i <= m; i++) {
    dist[i][0] = i // delete all i characters
  }
  for (let j = 0; j <= n; j++) {
    dist[0][j] = j // insert all j characters
  }
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (word1[i - 1] === word2[j - 1]) {
        dist[i][j] = dist[i - 1][j - 1] // last characters already agree
      } else {
        const replace = dist[i - 1][j - 1]
        const remove = dist[i - 1][j]
        const insert = dist[i][j - 1]
        dist[i][j] = 1 + Math.min(replace, Math.min(remove, insert))
      }
    }
  }
  return dist[m][n]
}
