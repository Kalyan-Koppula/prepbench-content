function findOrder(numCourses: number, prerequisites: number[][]): number[] {
  // DFS: a course is added after everything that depends on it, then reverse.
  const adj: number[][] = []
  for (let c = 0; c < numCourses; c++) {
    adj.push([])
  }
  for (let i = 0; i < prerequisites.length; i++) {
    adj[prerequisites[i][1]].push(prerequisites[i][0])
  }
  const state = new Array(numCourses).fill(0) // 0 new, 1 on path, 2 done
  const finished: number[] = []

  function visit(v: number): boolean {
    if (state[v] === 1) {
      return false // cycle
    }
    if (state[v] === 2) {
      return true
    }
    state[v] = 1
    for (let j = 0; j < adj[v].length; j++) {
      if (!visit(adj[v][j])) {
        return false
      }
    }
    state[v] = 2
    finished.push(v)
    return true
  }

  for (let c = 0; c < numCourses; c++) {
    if (!visit(c)) {
      return []
    }
  }
  const order: number[] = []
  for (let i = finished.length - 1; i >= 0; i--) {
    order.push(finished[i])
  }
  return order
}
