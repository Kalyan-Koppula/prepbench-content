// 0-1 BFS over (i, j) = characters of word1 / word2 consumed. Free move on a match;
// cost-1 moves for replace (i+1, j+1), delete (i+1, j) and insert (i, j+1).
function minDistance(word1: string, word2: string): number {
  const m = word1.length
  const n = word2.length
  const id = (i: number, j: number) => i * (n + 1) + j
  const dist = new Array((m + 1) * (n + 1)).fill(Infinity)
  dist[0] = 0
  let deque: number[] = [0]
  let next: number[] = []
  for (let d = 0; deque.length; d++) {
    // Process every state at distance d (free moves stay in this layer).
    while (deque.length) {
      const u = deque.pop()!
      if (dist[u] !== d) continue
      const i = Math.floor(u / (n + 1))
      const j = u % (n + 1)
      if (i === m && j === n) return d
      const relax = (v: number, nd: number, sameLayer: boolean) => {
        if (nd < dist[v]) {
          dist[v] = nd
          ;(sameLayer ? deque : next).push(v)
        }
      }
      if (i < m && j < n && word1[i] === word2[j]) relax(id(i + 1, j + 1), d, true)
      if (i < m && j < n) relax(id(i + 1, j + 1), d + 1, false)
      if (i < m) relax(id(i + 1, j), d + 1, false)
      if (j < n) relax(id(i, j + 1), d + 1, false)
    }
    deque = next
    next = []
  }
  return dist[id(m, n)]
}
