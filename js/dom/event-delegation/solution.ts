type DelegateHandler = (this: Element, event: Event, matched: Element) => void

function delegate(root: Element, selector: string, type: string, handler: DelegateHandler): () => void {
  const listener = (event: Event) => {
    const target = event.target as Node | null
    // A text node can't run `closest`; start from its parent element.
    const start = target && target.nodeType === 1 ? (target as Element) : target?.parentElement
    const match = start?.closest(selector)
    if (!match || match === root || !root.contains(match)) return
    handler.call(match, event, match)
  }
  root.addEventListener(type, listener)
  return () => root.removeEventListener(type, listener)
}
