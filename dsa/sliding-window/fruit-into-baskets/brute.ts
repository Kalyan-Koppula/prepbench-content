function totalFruit(fruits: number[]): number {
  let best = 0
  for (let i = 0; i < fruits.length; i++) {
    const types = new Set<number>()
    for (let j = i; j < fruits.length; j++) {
      types.add(fruits[j])
      if (types.size > 2) break
      best = Math.max(best, j - i + 1)
    }
  }
  return best
}
