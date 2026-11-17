type DelegateHandler = (this: Element, event: Event, matched: Element) => void

function delegate(root: Element, selector: string, type: string, handler: DelegateHandler): () => void {
  // TODO
  return () => {}
}
