function chunk<T>(array: T[], size: number): T[][] {
  if (!Number.isInteger(size) || size < 1) throw new RangeError(`size must be a positive integer, got ${size}`)
  const out: T[][] = []
  for (let i = 0; i < array.length; i += size) out.push(array.slice(i, i + size))
  return out
}
