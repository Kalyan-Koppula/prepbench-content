function leastInterval(tasks: string[], n: number): number {
  // Simulate one time unit at a time, scanning all 26 labels each unit.
  const left = new Array(26).fill(0)
  const nextFree = new Array(26).fill(0)
  for (let i = 0; i < tasks.length; i++) {
    left[tasks[i].charCodeAt(0) - 65]++
  }
  let remaining = tasks.length
  let time = 0
  while (remaining > 0) {
    // Run the available label with the most copies left; otherwise stay idle.
    let pick = -1
    for (let c = 0; c < 26; c++) {
      if (left[c] > 0 && nextFree[c] <= time && (pick === -1 || left[c] > left[pick])) {
        pick = c
      }
    }
    if (pick !== -1) {
      left[pick]--
      nextFree[pick] = time + n + 1
      remaining--
    }
    time++
  }
  return time
}
