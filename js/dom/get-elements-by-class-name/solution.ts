function getElementsByClassName(root: Element, classNames: string): Element[] {
  const wanted = classNames.split(/\s+/).filter(Boolean)
  const result: Element[] = []
  if (wanted.length === 0) return result

  const visit = (parent: Element) => {
    for (const child of Array.from(parent.children)) {
      if (wanted.every((name) => child.classList.contains(name))) result.push(child)
      visit(child)
    }
  }

  visit(root)
  return result
}
