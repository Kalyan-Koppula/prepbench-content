function dailyTemperatures(temperatures: number[]): number[] {
  const answer = new Array(temperatures.length).fill(0)
  const waiting: number[] = [] // indices with non-increasing temperatures
  for (let i = 0; i < temperatures.length; i++) {
    while (waiting.length && temperatures[waiting[waiting.length - 1]] < temperatures[i]) {
      const day = waiting.pop()!
      answer[day] = i - day
    }
    waiting.push(i)
  }
  return answer
}
