function totalFruit(fruits: number[]): number {
  const count = new Map<number, number>()
  let left = 0
  let best = 0
  for (let right = 0; right < fruits.length; right++) {
    count.set(fruits[right], (count.get(fruits[right]) ?? 0) + 1)
    while (count.size > 2) {
      const f = fruits[left++]
      const c = count.get(f)! - 1
      if (c === 0) count.delete(f)
      else count.set(f, c)
    }
    best = Math.max(best, right - left + 1)
  }
  return best
}
