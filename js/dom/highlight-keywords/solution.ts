function highlight(root: Element, keywords: string[]): number {
  const words = keywords.filter((k) => k.length > 0).sort((a, b) => b.length - a.length)
  if (words.length === 0) return 0
  const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const pattern = new RegExp(words.map(escape).join('|'), 'gi')
  const SKIP = new Set(['MARK', 'SCRIPT', 'STYLE'])

  // Collect first: replacing nodes while walking would disturb the walk.
  const texts: Text[] = []
  const collect = (node: Node) => {
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === 3) texts.push(child as Text)
      else if (child.nodeType === 1 && !SKIP.has((child as Element).tagName)) collect(child)
    }
  }
  collect(root)

  let count = 0
  for (const text of texts) {
    const value = text.data
    const doc = text.ownerDocument
    const fragment = doc.createDocumentFragment()
    let last = 0
    for (const match of value.matchAll(pattern)) {
      const start = match.index!
      if (start > last) fragment.appendChild(doc.createTextNode(value.slice(last, start)))
      const mark = doc.createElement('mark')
      mark.textContent = match[0]
      fragment.appendChild(mark)
      last = start + match[0].length
      count++
    }
    if (last === 0) continue // no matches in this node
    if (last < value.length) fragment.appendChild(doc.createTextNode(value.slice(last)))
    text.parentNode!.replaceChild(fragment, text)
  }
  return count
}
