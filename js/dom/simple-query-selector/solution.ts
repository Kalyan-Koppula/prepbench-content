interface Compound {
  tag: string | null
  ids: string[]
  classes: string[]
}

function parseCompound(part: string): Compound {
  const compound: Compound = { tag: null, ids: [], classes: [] }
  // A leading tag (or *), then any number of #id / .class pieces.
  const re = /^([a-zA-Z][\w-]*|\*)|([#.])([\w-]+)/g
  for (const m of part.matchAll(re)) {
    if (m[1]) compound.tag = m[1] === '*' ? null : m[1].toLowerCase()
    else if (m[2] === '#') compound.ids.push(m[3])
    else compound.classes.push(m[3])
  }
  return compound
}

function matchesCompound(el: Element, c: Compound) {
  if (c.tag && el.tagName.toLowerCase() !== c.tag) return false
  if (c.ids.some((id) => el.id !== id)) return false
  return c.classes.every((cls) => el.classList.contains(cls))
}

function querySelectorAllLite(root: Element | Document, selector: string): Element[] {
  const compounds = selector.trim().split(/\s+/).filter(Boolean).map(parseCompound)
  if (compounds.length === 0) return []
  const last = compounds[compounds.length - 1]

  const matchesSelector = (el: Element) => {
    if (!matchesCompound(el, last)) return false
    // Walk up, consuming the remaining compounds right to left. Taking the
    // nearest matching ancestor is safe with descendant combinators only.
    let i = compounds.length - 2
    for (let anc = el.parentElement; anc && i >= 0; anc = anc.parentElement) {
      if (matchesCompound(anc, compounds[i])) i--
    }
    return i < 0
  }

  const result: Element[] = []
  const visit = (parent: Element | Document) => {
    for (const child of Array.from(parent.children)) {
      if (matchesSelector(child)) result.push(child)
      visit(child)
    }
  }
  visit(root)
  return result
}
