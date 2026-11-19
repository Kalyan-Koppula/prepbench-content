function dailyTemperatures(temperatures: number[]): number[] {
  const n = temperatures.length
  const answer = new Array(n).fill(0)
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (temperatures[j] > temperatures[i]) {
        answer[i] = j - i
        break
      }
    }
  }
  return answer
}
