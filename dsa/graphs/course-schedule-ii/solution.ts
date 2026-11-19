function findOrder(numCourses: number, prerequisites: number[][]): number[] {
  const unlocks: number[][] = []
  for (let c = 0; c < numCourses; c++) {
    unlocks.push([])
  }
  const missing = new Array(numCourses).fill(0)
  for (let i = 0; i < prerequisites.length; i++) {
    const course = prerequisites[i][0]
    const pre = prerequisites[i][1]
    unlocks[pre].push(course)
    missing[course]++
  }
  // `order` is also the queue: everything in it is ready to take.
  const order: number[] = []
  for (let c = 0; c < numCourses; c++) {
    if (missing[c] === 0) {
      order.push(c)
    }
  }
  let head = 0
  while (head < order.length) {
    const c = order[head]
    head++
    for (let j = 0; j < unlocks[c].length; j++) {
      const next = unlocks[c][j]
      missing[next]--
      if (missing[next] === 0) {
        order.push(next)
      }
    }
  }
  if (order.length < numCourses) {
    return [] // some courses are in a cycle
  }
  return order
}
