function dailyTemperatures(temperatures: number[]): number[] {
  return temperatures.map((t, i) => {
    for (let j = i + 1; j < temperatures.length; j++) if (temperatures[j] > t) return j - i
    return 0
  })
}
