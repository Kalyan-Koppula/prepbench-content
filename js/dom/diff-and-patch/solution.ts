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

function removeProp(el: Element, name: string, value: unknown) {
  if (isEvent(name)) el.removeEventListener(name.slice(2).toLowerCase(), value as EventListener)
  else el.removeAttribute(name === 'className' ? 'class' : name)
}

function changed(a: VNode | string, b: VNode | string) {
  if (typeof a !== typeof b) return true
  if (typeof a === 'string') return a !== b
  return a.type !== (b as VNode).type
}

function patchProps(el: Element, oldProps: Record<string, unknown> = {}, newProps: Record<string, unknown> = {}) {
  for (const name of Object.keys(oldProps)) {
    if (!(name in newProps)) removeProp(el, name, oldProps[name])
  }
  for (const [name, value] of Object.entries(newProps)) {
    const old = oldProps[name]
    if (old === value) continue
    // An event listener has to be swapped: removing it first stops the old one firing.
    if (isEvent(name) && old !== undefined) removeProp(el, name, old)
    setProp(el, name, value)
  }
}

function patch(parent: Node, oldVNode: VNode | string | undefined, newVNode: VNode | string | undefined, index = 0): void {
  const node = parent.childNodes[index]

  if (oldVNode === undefined) {
    if (newVNode !== undefined) parent.appendChild(createNode(newVNode))
    return
  }
  if (newVNode === undefined) {
    parent.removeChild(node)
    return
  }
  if (changed(oldVNode, newVNode)) {
    parent.replaceChild(createNode(newVNode), node)
    return
  }
  if (typeof oldVNode === 'string') return // same text: nothing to do

  const el = node as Element
  const next = newVNode as VNode
  patchProps(el, oldVNode.props, next.props)

  const oldChildren = oldVNode.children ?? []
  const newChildren = next.children ?? []
  const common = Math.min(oldChildren.length, newChildren.length)
  for (let i = 0; i < common; i++) patch(el, oldChildren[i], newChildren[i], i)
  // Remove extras from the end so earlier indexes stay valid.
  for (let i = oldChildren.length - 1; i >= newChildren.length; i--) patch(el, oldChildren[i], undefined, i)
  for (let i = oldChildren.length; i < newChildren.length; i++) patch(el, undefined, newChildren[i], i)
}
