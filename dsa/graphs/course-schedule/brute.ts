function canFinish(numCourses: number, prerequisites: number[][]): boolean {
  // DFS cycle detection with three colours.
  const adj: number[][] = []
  for (let c = 0; c < numCourses; c++) {
    adj.push([])
  }
  for (let i = 0; i < prerequisites.length; i++) {
    adj[prerequisites[i][1]].push(prerequisites[i][0])
  }
  const state = new Array(numCourses).fill(0) // 0 new, 1 on the current path, 2 done

  function hasCycle(v: number): boolean {
    if (state[v] === 1) {
      return true // back to a course on the current path
    }
    if (state[v] === 2) {
      return false
    }
    state[v] = 1
    for (let j = 0; j < adj[v].length; j++) {
      if (hasCycle(adj[v][j])) {
        return true
      }
    }
    state[v] = 2
    return false
  }

  for (let c = 0; c < numCourses; c++) {
    if (hasCycle(c)) {
      return false
    }
  }
  return true
}
