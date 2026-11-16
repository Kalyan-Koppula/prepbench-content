function leastInterval(tasks: string[], n: number): number {
  const counts = new Map<string, number>()
  for (const t of tasks) counts.set(t, (counts.get(t) ?? 0) + 1)

  const ready = new PriorityQueue<number>((a, b) => b - a) // remaining counts, max first
  for (const c of counts.values()) ready.push(c)
  const cooling: [number, number][] = [] // [remaining count, time it becomes available]
  let head = 0

  let time = 0
  while (!ready.isEmpty() || head < cooling.length) {
    // Nothing runnable: skip straight to the next task coming off cooldown.
    if (ready.isEmpty()) time = cooling[head][1]
    else {
      time++
      const left = ready.pop()! - 1
      if (left > 0) cooling.push([left, time + n])
    }
    if (head < cooling.length && cooling[head][1] === time) ready.push(cooling[head++][0])
  }
  return time
}
