function findOrder(numCourses: number, prerequisites: number[][]): number[] {
  const adj: number[][] = Array.from({ length: numCourses }, () => [])
  for (const [a, b] of prerequisites) adj[b].push(a)
  const state = new Array(numCourses).fill(0) // 0 new, 1 on path, 2 done
  const post: number[] = []
  const dfs = (v: number): boolean => {
    if (state[v] === 1) return false
    if (state[v] === 2) return true
    state[v] = 1
    for (const w of adj[v]) if (!dfs(w)) return false
    state[v] = 2
    post.push(v)
    return true
  }
  for (let v = 0; v < numCourses; v++) if (!dfs(v)) return []
  return post.reverse()
}
