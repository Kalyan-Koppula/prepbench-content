function objectAssign(target: any, ...sources: any[]): any {
  if (target === null || target === undefined) throw new TypeError('Cannot convert undefined or null to object')
  const to = Object(target)
  for (const source of sources) {
    if (source === null || source === undefined) continue
    const from = Object(source)
    for (const key of Reflect.ownKeys(from)) {
      const desc = Object.getOwnPropertyDescriptor(from, key)
      if (desc && desc.enumerable) to[key] = from[key]
    }
  }
  return to
}
