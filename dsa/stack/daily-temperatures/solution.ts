function dailyTemperatures(temperatures: number[]): number[] {
  const n = temperatures.length
  const answer = new Array(n).fill(0)
  // Indices of days still waiting for a warmer day.
  // Their temperatures never increase from bottom to top.
  const waiting: number[] = []
  for (let i = 0; i < n; i++) {
    // Today is the first warmer day for every cooler day on top of the stack.
    while (waiting.length > 0 && temperatures[waiting[waiting.length - 1]] < temperatures[i]) {
      const day = waiting.pop() as number
      answer[day] = i - day
    }
    waiting.push(i)
  }
  return answer // days left on the stack keep 0
}
