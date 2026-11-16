function leastInterval(tasks: string[], n: number): number {
  const left = new Array(26).fill(0)
  const nextFree = new Array(26).fill(0)
  for (const t of tasks) left[t.charCodeAt(0) - 65]++
  let remaining = tasks.length
  let time = 0
  while (remaining > 0) {
    // Run the available label with the most copies left; otherwise idle.
    let pick = -1
    for (let i = 0; i < 26; i++) {
      if (left[i] > 0 && nextFree[i] <= time && (pick === -1 || left[i] > left[pick])) pick = i
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
