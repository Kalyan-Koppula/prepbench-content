type VChild = VNode | string | number | boolean | null | undefined | VChild[]

interface VNode {
  type: string
  props?: Record<string, unknown> | null
  children?: VChild[]
}

function render(vnode: VNode | string | number): Node {
  // TODO
  return document.createTextNode('')
}
