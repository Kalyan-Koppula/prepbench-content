function totalFruit(fruits: number[]): number {
  // count: fruit type -> how many of that type are in the window.
  // count.size is the number of distinct types, so zero counts are deleted.
  const count = new Map<number, number>()
  let left = 0
  let best = 0
  for (let right = 0; right < fruits.length; right++) {
    const added = fruits[right]
    const before = count.get(added)
    if (before === undefined) {
      count.set(added, 1)
    } else {
      count.set(added, before + 1)
    }

    // Three types: drop fruit from the left until one type is gone.
    while (count.size > 2) {
      const removed = fruits[left]
      const remaining = (count.get(removed) as number) - 1
      if (remaining === 0) {
        count.delete(removed)
      } else {
        count.set(removed, remaining)
      }
      left++
    }

    const length = right - left + 1
    if (length > best) {
      best = length
    }
  }
  return best
}
