function myFlat(this: unknown[], depth?: number): unknown[] {
  let d = depth === undefined ? 1 : Number(depth)
  if (Number.isNaN(d)) d = 0
  const out: unknown[] = []

  function walk(source: ArrayLike<unknown>, level: number) {
    for (let i = 0; i < source.length; i++) {
      if (!(i in source)) continue
      const item = source[i]
      if (level > 0 && Array.isArray(item)) walk(item, level - 1)
      else out.push(item)
    }
  }

  walk(Object(this), d)
  return out
}
