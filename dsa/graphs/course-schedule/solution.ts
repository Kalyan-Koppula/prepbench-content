function canFinish(numCourses: number, prerequisites: number[][]): boolean {
  const unlocks: number[][] = Array.from({ length: numCourses }, () => [])
  const indegree = new Array(numCourses).fill(0)
  for (const [course, pre] of prerequisites) {
    unlocks[pre].push(course)
    indegree[course]++
  }

  const ready: number[] = []
  for (let c = 0; c < numCourses; c++) if (indegree[c] === 0) ready.push(c)

  let taken = 0
  while (ready.length) {
    const c = ready.pop()!
    taken++
    for (const next of unlocks[c]) if (--indegree[next] === 0) ready.push(next)
  }
  return taken === numCourses
}
