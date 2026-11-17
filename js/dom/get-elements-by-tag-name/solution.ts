function getElementsByTagName(root: Element, tagName: string): Element[] {
  const wanted = tagName.toLowerCase()
  const matches = (el: Element) => wanted === '*' || el.tagName.toLowerCase() === wanted
  const result: Element[] = []

  // Explicit stack instead of recursion; children are pushed in reverse so
  // the leftmost one is popped first, giving document order.
  const stack: Element[] = Array.from(root.children).reverse()
  while (stack.length) {
    const el = stack.pop()!
    if (matches(el)) result.push(el)
    for (let i = el.children.length - 1; i >= 0; i--) stack.push(el.children[i])
  }
  return result
}
