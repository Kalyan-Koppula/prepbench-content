test('renders strings and numbers as text nodes', () => {
  const text = render('hello')
  expect(text.nodeType).toBe(3)
  expect(text.textContent).toBe('hello')
  expect(render(42).textContent).toBe('42')
})

test('renders an element with attributes and className', () => {
  const el = render({ type: 'a', props: { href: '/docs', className: 'link active', 'data-id': 7 }, children: ['Docs'] })
  expect(el.tagName.toLowerCase()).toBe('a')
  expect(el.getAttribute('href')).toBe('/docs')
  expect(el.getAttribute('class')).toBe('link active')
  expect(el.getAttribute('data-id')).toBe('7')
  expect(el.hasAttribute('className')).toBe(false)
  expect(el.textContent).toBe('Docs')
})

test('works without props or children', () => {
  expect(render({ type: 'hr' }).outerHTML).toBe('<hr>')
  expect(render({ type: 'div', props: null, children: [] }).outerHTML).toBe('<div></div>')
})

test('renders nested children in order', () => {
  const el = render({
    type: 'ul',
    children: [
      { type: 'li', children: ['one'] },
      { type: 'li', props: { id: 'two' }, children: ['t', 'w', { type: 'b', children: ['o'] }] },
    ],
  })
  expect(el.outerHTML).toBe('<ul><li>one</li><li id="two">tw<b>o</b></li></ul>')
})

test('flattens nested arrays and skips empty children', () => {
  const items = ['a', 'b']
  const el = render({
    type: 'div',
    children: [null, items.map((x) => ({ type: 'i', children: [x] })), false, [[0]], undefined, true, ''],
  })
  expect(el.innerHTML).toBe('<i>a</i><i>b</i>0')
})

test('treats strings as text, never as markup', () => {
  const el = render({ type: 'p', children: ['<b>not bold</b>'] })
  expect(el.children.length).toBe(0)
  expect(el.textContent).toBe('<b>not bold</b>')
})

test('attaches event handlers instead of attributes', () => {
  const onClick = fn()
  const onMouseEnter = fn()
  const el = render({ type: 'button', props: { onClick, onMouseEnter }, children: ['Go'] })
  expect(el.hasAttribute('onClick')).toBe(false)
  expect(el.hasAttribute('onclick')).toBe(false)
  el.dispatchEvent(new window.Event('click'))
  el.dispatchEvent(new window.Event('mouseenter'))
  expect(onClick).toHaveBeenCalledTimes(1)
  expect(onClick.mock.calls[0][0].type).toBe('click')
  expect(onMouseEnter).toHaveBeenCalledTimes(1)
})

test('handles events on nested children', () => {
  const onKeyDown = fn()
  const root = render({ type: 'form', children: [{ type: 'input', props: { name: 'q', onKeyDown } }] })
  root.firstChild.dispatchEvent(new window.Event('keydown'))
  expect(onKeyDown).toHaveBeenCalledTimes(1)
})

test('sets boolean attributes and ignores false and null props', () => {
  const el = render({ type: 'input', props: { disabled: true, readonly: false, placeholder: null, value: undefined, type: 'text' } })
  expect(el.getAttribute('disabled')).toBe('')
  expect(el.hasAttribute('readonly')).toBe(false)
  expect(el.hasAttribute('placeholder')).toBe(false)
  expect(el.hasAttribute('value')).toBe(false)
  expect(el.getAttribute('type')).toBe('text')
})

test('applies a style object to el.style', () => {
  const el = render({ type: 'div', props: { style: { color: 'red', fontSize: '12px' } } })
  expect(el.style.color).toBe('red')
  expect(el.style.fontSize).toBe('12px')
  expect(el.getAttribute('style')).not.toContain('[object')
})
