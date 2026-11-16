function findOrder(numCourses: number, prerequisites: number[][]): number[] {
  const unlocks: number[][] = Array.from({ length: numCourses }, () => [])
  const indegree = new Array(numCourses).fill(0)
  for (const [course, pre] of prerequisites) {
    unlocks[pre].push(course)
    indegree[course]++
  }

  const order: number[] = []
  for (let c = 0; c < numCourses; c++) if (indegree[c] === 0) order.push(c)
  // `order` doubles as the BFS queue: everything in it is ready to take.
  for (let head = 0; head < order.length; head++) {
    for (const next of unlocks[order[head]]) if (--indegree[next] === 0) order.push(next)
  }
  return order.length === numCourses ? order : []
}
