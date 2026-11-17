function flatten(array: unknown[], depth = 1): unknown[] {
  const out: unknown[] = []
  const walk = (items: unknown[], remaining: number) => {
    // forEach skips holes, just like .flat()
    items.forEach((item) => {
      if (Array.isArray(item) && remaining > 0) walk(item, remaining - 1)
      else out.push(item)
    })
  }
  walk(array, depth)
  return out
}
