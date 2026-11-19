function totalFruit(fruits: number[]): number {
  let best = 0
  for (let start = 0; start < fruits.length; start++) {
    // Walk right from start, remembering the (at most two) types picked.
    let typeA = -1
    let typeB = -1
    for (let end = start; end < fruits.length; end++) {
      const f = fruits[end]
      if (f !== typeA && f !== typeB) {
        if (typeA === -1) {
          typeA = f
        } else if (typeB === -1) {
          typeB = f
        } else {
          break // a third type: no basket left
        }
      }
      if (end - start + 1 > best) {
        best = end - start + 1
      }
    }
  }
  return best
}
