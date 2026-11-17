function getUniqueSelector(el: Element): string {
  const doc = el.ownerDocument
  const steps: string[] = []
  let node: Element | null = el

  while (node) {
    if (node.id) {
      steps.unshift(`#${node.id}`)
      break
    }

    let step = node.tagName.toLowerCase()
    const parent = node.parentElement
    if (parent) {
      const siblings = Array.from(parent.children)
      if (siblings.some((s) => s !== node && s.tagName === node!.tagName)) step += `:nth-child(${siblings.indexOf(node) + 1})`
    }
    steps.unshift(step)

    const selector = steps.join(' > ')
    if (doc.querySelectorAll(selector).length === 1) return selector
    node = parent
  }

  return steps.join(' > ')
}
