interface VNode {
  type: string
  props?: Record<string, unknown>
  children?: (VNode | string)[]
}

// Provided: builds a real node from a virtual one.
function createNode(vnode: VNode | string): Node {
  if (typeof vnode === 'string') return document.createTextNode(vnode)
  const el = document.createElement(vnode.type)
  for (const [name, value] of Object.entries(vnode.props ?? {})) setProp(el, name, value)
  for (const child of vnode.children ?? []) el.appendChild(createNode(child))
  return el
}

function isEvent(name: string) {
  return /^on[A-Z]/.test(name)
}

function setProp(el: Element, name: string, value: unknown) {
  if (isEvent(name)) el.addEventListener(name.slice(2).toLowerCase(), value as EventListener)
  else el.setAttribute(name === 'className' ? 'class' : name, String(value))
}

function patch(parent: Node, oldVNode: VNode | string | undefined, newVNode: VNode | string | undefined, index = 0): void {
  // TODO
}
