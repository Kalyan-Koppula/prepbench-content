// The tests build the starting DOM themselves so they don't depend on your code.
function build(v) {
  if (typeof v === 'string') return document.createTextNode(v)
  const el = document.createElement(v.type)
  for (const [k, val] of Object.entries(v.props || {})) {
    if (/^on[A-Z]/.test(k)) el.addEventListener(k.slice(2).toLowerCase(), val)
    else el.setAttribute(k === 'className' ? 'class' : k, String(val))
  }
  for (const c of v.children || []) el.appendChild(build(c))
  return el
}
function mount(v) {
  const root = document.createElement('div')
  root.appendChild(build(v))
  return root
}
const h = (type, props, ...children) => ({ type, props: props || {}, children })

test('updates changed text without replacing the element around it', () => {
  const a = h('p', null, 'Hello')
  const root = mount(a)
  const p = root.firstChild
  patch(root, a, h('p', null, 'Goodbye'))
  expect(root.innerHTML).toBe('<p>Goodbye</p>')
  expect(root.firstChild).toBe(p)
})

test('adds and changes attributes in place', () => {
  const a = h('a', { href: '/a', className: 'link' }, 'x')
  const root = mount(a)
  const el = root.firstChild
  patch(root, a, h('a', { href: '/b', className: 'link active', title: 'B' }, 'x'))
  expect(root.firstChild).toBe(el)
  expect(el.getAttribute('href')).toBe('/b')
  expect(el.getAttribute('class')).toBe('link active')
  expect(el.getAttribute('title')).toBe('B')
})

test('removes props that are no longer present', () => {
  const a = h('div', { id: 'box', className: 'big', 'data-x': '1' })
  const root = mount(a)
  patch(root, a, h('div', { id: 'box' }))
  expect(root.innerHTML).toBe('<div id="box"></div>')
})

test('appends new children in order', () => {
  const a = h('ul', null, h('li', null, '1'))
  const root = mount(a)
  const first = root.firstChild.firstChild
  patch(root, a, h('ul', null, h('li', null, '1'), h('li', null, '2'), h('li', null, '3')))
  expect(root.innerHTML).toBe('<ul><li>1</li><li>2</li><li>3</li></ul>')
  expect(root.firstChild.firstChild).toBe(first)
})

test('removes several trailing children', () => {
  const a = h('ol', null, h('li', null, 'a'), h('li', null, 'b'), h('li', null, 'c'), h('li', null, 'd'))
  const root = mount(a)
  const keep = root.firstChild.firstChild
  patch(root, a, h('ol', null, h('li', null, 'a')))
  expect(root.innerHTML).toBe('<ol><li>a</li></ol>')
  expect(root.firstChild.firstChild).toBe(keep)
})

test('replaces a node whose type changes', () => {
  const a = h('div', null, h('span', null, 'x'), 'text', h('b', null, 'y'))
  const root = mount(a)
  const outer = root.firstChild
  const last = outer.lastChild
  patch(root, a, h('div', null, h('em', null, 'x'), h('i', null, 'now an element'), h('b', null, 'y')))
  expect(root.innerHTML).toBe('<div><em>x</em><i>now an element</i><b>y</b></div>')
  expect(root.firstChild).toBe(outer)
  expect(outer.lastChild).toBe(last)
})

test('replaces an element with text and back', () => {
  const a = h('p', null, h('b', null, 'bold'))
  const root = mount(a)
  const b = h('p', null, 'plain')
  patch(root, a, b)
  expect(root.innerHTML).toBe('<p>plain</p>')
  patch(root, b, h('p', null, h('i', null, 'it')))
  expect(root.innerHTML).toBe('<p><i>it</i></p>')
})

test('swaps and removes event listeners', () => {
  const first = fn()
  const second = fn()
  const hover = fn()
  const a = h('button', { onClick: first, onMouseOver: hover }, 'Go')
  const root = mount(a)
  const btn = root.firstChild
  patch(root, a, h('button', { onClick: second }, 'Go'))
  btn.dispatchEvent(new window.Event('click'))
  btn.dispatchEvent(new window.Event('mouseover'))
  expect(first).not.toHaveBeenCalled()
  expect(second).toHaveBeenCalledTimes(1)
  expect(hover).not.toHaveBeenCalled()
  expect(btn.hasAttribute('onclick')).toBe(false)
})

test('patches deep changes and leaves untouched branches alone', () => {
  const a = h('main', null, h('nav', null, h('a', { href: '/' }, 'Home')), h('section', null, h('h1', null, 'Old'), h('p', null, 'Body')))
  const root = mount(a)
  const nav = root.querySelector('nav')
  const h1 = root.querySelector('h1')
  const p = root.querySelector('p')
  patch(root, a, h('main', null, h('nav', null, h('a', { href: '/' }, 'Home')), h('section', null, h('h1', null, 'New'), h('p', null, 'Body'))))
  expect(root.innerHTML).toBe('<main><nav><a href="/">Home</a></nav><section><h1>New</h1><p>Body</p></section></main>')
  expect(root.querySelector('nav')).toBe(nav)
  expect(root.querySelector('h1')).toBe(h1)
  expect(root.querySelector('p')).toBe(p)
})

test('patches the child at the given index and handles adding or removing it', () => {
  const root = document.createElement('div')
  root.innerHTML = '<span>a</span><span>b</span>'
  patch(root, h('span', null, 'b'), h('span', null, 'B'), 1)
  expect(root.innerHTML).toBe('<span>a</span><span>B</span>')
  patch(root, undefined, h('span', null, 'c'), 2)
  expect(root.innerHTML).toBe('<span>a</span><span>B</span><span>c</span>')
  patch(root, h('span', null, 'a'), undefined, 0)
  expect(root.innerHTML).toBe('<span>B</span><span>c</span>')
})
