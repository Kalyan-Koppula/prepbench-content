type ClassValue = string | number | boolean | null | undefined | ClassValue[] | Record<string, unknown>

function classNames(...args: ClassValue[]): string {
  const classes: string[] = []
  const visit = (value: unknown) => {
    if (!value) return
    if (typeof value === 'string' || typeof value === 'number') {
      classes.push(String(value))
    } else if (Array.isArray(value)) {
      value.forEach(visit)
    } else if (typeof value === 'object') {
      for (const key of Object.keys(value)) {
        if ((value as Record<string, unknown>)[key]) classes.push(key)
      }
    }
  }
  args.forEach(visit)
  return classes.join(' ')
}
