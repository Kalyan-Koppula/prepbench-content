function leastInterval(tasks: string[], n: number): number {
  // How many copies of each label are left.
  const counts = new Array(26).fill(0)
  for (let i = 0; i < tasks.length; i++) {
    counts[tasks[i].charCodeAt(0) - 65]++
  }
  // Runnable labels, by remaining copies (most first).
  const ready = new PriorityQueue<number>((a, b) => b - a)
  for (let c = 0; c < 26; c++) {
    if (counts[c] > 0) {
      ready.push(counts[c])
    }
  }
  // Labels cooling down, in the order they become available again.
  const coolingCounts: number[] = []
  const coolingUntil: number[] = []
  let head = 0

  let time = 0
  while (!ready.isEmpty() || head < coolingCounts.length) {
    if (ready.isEmpty()) {
      time = coolingUntil[head] // nothing can run: jump to the next release
    } else {
      time++
      const left = (ready.pop() as number) - 1 // run the most frequent runnable label
      if (left > 0) {
        coolingCounts.push(left)
        coolingUntil.push(time + n)
      }
    }
    // A label whose cooldown just ended can run again.
    if (head < coolingCounts.length && coolingUntil[head] === time) {
      ready.push(coolingCounts[head])
      head++
    }
  }
  return time
}
