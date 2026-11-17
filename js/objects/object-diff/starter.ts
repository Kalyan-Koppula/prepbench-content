interface Diff {
  added: string[]
  removed: string[]
  changed: string[]
}

function diff(before: Record<string, unknown>, after: Record<string, unknown>): Diff {
  // TODO
  return { added: [], removed: [], changed: [] }
}
