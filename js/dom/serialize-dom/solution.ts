type SerializedNode = string | { tag: string; attributes: Record<string, string>; children: SerializedNode[] }

function serialize(node: Node | null | undefined): SerializedNode | null {
  if (!node) return null
  if (node.nodeType === 3) return node.textContent ?? ''
  if (node.nodeType !== 1) return null

  const el = node as Element
  const attributes: Record<string, string> = {}
  for (const attr of Array.from(el.attributes)) attributes[attr.name] = attr.value

  const children: SerializedNode[] = []
  for (const child of Array.from(el.childNodes)) {
    // Whitespace-only text is formatting, not content.
    if (child.nodeType === 3 && !(child.textContent ?? '').trim()) continue
    const serialized = serialize(child)
    if (serialized !== null) children.push(serialized)
  }

  return { tag: el.tagName.toLowerCase(), attributes, children }
}
