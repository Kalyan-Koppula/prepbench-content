type VChild = VNode | string | number | boolean | null | undefined | VChild[]

interface VNode {
  type: string
  props?: Record<string, unknown> | null
  children?: VChild[]
}

function render(vnode: VNode | string | number): Node {
  if (typeof vnode === 'string' || typeof vnode === 'number') return document.createTextNode(String(vnode))

  const el = document.createElement(vnode.type)

  for (const [name, value] of Object.entries(vnode.props ?? {})) {
    if (value === false || value === null || value === undefined) continue
    if (name === 'className') {
      el.setAttribute('class', String(value))
    } else if (name === 'style' && typeof value === 'object') {
      Object.assign(el.style, value)
    } else if (/^on[A-Z]/.test(name) && typeof value === 'function') {
      el.addEventListener(name.slice(2).toLowerCase(), value as EventListener)
    } else {
      el.setAttribute(name, value === true ? '' : String(value))
    }
  }

  const append = (child: VChild) => {
    if (Array.isArray(child)) child.forEach(append)
    else if (child === null || child === undefined || typeof child === 'boolean') return
    else el.appendChild(render(child))
  }
  ;(vnode.children ?? []).forEach(append)

  return el
}
