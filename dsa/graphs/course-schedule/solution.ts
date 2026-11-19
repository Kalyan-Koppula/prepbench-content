function canFinish(numCourses: number, prerequisites: number[][]): boolean {
  // Kahn's algorithm: repeatedly take a course with no unmet prerequisites.
  const unlocks: number[][] = [] // pre -> courses that list it as a prerequisite
  for (let c = 0; c < numCourses; c++) {
    unlocks.push([])
  }
  const missing = new Array(numCourses).fill(0) // unmet prerequisites per course
  for (let i = 0; i < prerequisites.length; i++) {
    const course = prerequisites[i][0]
    const pre = prerequisites[i][1]
    unlocks[pre].push(course)
    missing[course]++
  }
  const ready: number[] = []
  for (let c = 0; c < numCourses; c++) {
    if (missing[c] === 0) {
      ready.push(c)
    }
  }
  let taken = 0
  while (ready.length > 0) {
    const c = ready.pop() as number
    taken++
    for (let j = 0; j < unlocks[c].length; j++) {
      const next = unlocks[c][j]
      missing[next]--
      if (missing[next] === 0) {
        ready.push(next)
      }
    }
  }
  // Courses never taken are stuck in a cycle of prerequisites.
  return taken === numCourses
}
