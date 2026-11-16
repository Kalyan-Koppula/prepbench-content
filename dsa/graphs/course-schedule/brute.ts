function canFinish(numCourses: number, prerequisites: number[][]): boolean {
  const adj: number[][] = Array.from({ length: numCourses }, () => [])
  for (const [a, b] of prerequisites) adj[b].push(a)
  // 0 = unvisited, 1 = on the current DFS path, 2 = finished
  const state = new Array(numCourses).fill(0)
  const hasCycle = (v: number): boolean => {
    if (state[v] === 1) return true
    if (state[v] === 2) return false
    state[v] = 1
    for (const w of adj[v]) if (hasCycle(w)) return true
    state[v] = 2
    return false
  }
  for (let v = 0; v < numCourses; v++) if (hasCycle(v)) return false
  return true
}
