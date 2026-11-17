test('serializes an element with its attributes and text', () => {
  document.body.innerHTML = '<a id="home" href="/" class="nav link">Home</a>'
  expect(serialize(document.getElementById('home'))).toEqual({
    tag: 'a',
    attributes: { id: 'home', href: '/', class: 'nav link' },
    children: ['Home'],
  })
})

test('always includes attributes and children, even when empty', () => {
  const result = serialize(document.createElement('br'))
  expect(result).toEqual({ tag: 'br', attributes: {}, children: [] })
  expect(Object.keys(result).sort()).toEqual(['attributes', 'children', 'tag'])
})

test('serializes nested elements and mixed text in order', () => {
  document.body.innerHTML = '<p id="p">Hello <em>big</em> <strong>wide</strong> world</p>'
  expect(serialize(document.getElementById('p'))).toEqual({
    tag: 'p',
    attributes: { id: 'p' },
    children: [
      'Hello ',
      { tag: 'em', attributes: {}, children: ['big'] },
      { tag: 'strong', attributes: {}, children: ['wide'] },
      ' world',
    ],
  })
})

test('lower-cases tag names and keeps empty attribute values', () => {
  document.body.innerHTML = '<DIV id="d"><INPUT type="checkbox" checked data-role=""></DIV>'
  expect(serialize(document.getElementById('d'))).toEqual({
    tag: 'div',
    attributes: { id: 'd' },
    children: [{ tag: 'input', attributes: { type: 'checkbox', checked: '', 'data-role': '' }, children: [] }],
  })
})

test('drops comments and whitespace-only text but keeps other text untrimmed', () => {
  document.body.innerHTML = '<ul id="u">\n  <!-- first -->\n  <li>  one  </li>\n  \n</ul>'
  expect(serialize(document.getElementById('u'))).toEqual({
    tag: 'ul',
    attributes: { id: 'u' },
    children: [{ tag: 'li', attributes: {}, children: ['  one  '] }],
  })
})

test('returns plain strings for text nodes and null for other inputs', () => {
  expect(serialize(document.createTextNode('just text'))).toBe('just text')
  expect(serialize(document.createComment('nope'))).toBeNull()
  expect(serialize(null)).toBeNull()
  expect(serialize(undefined)).toBeNull()
})

test('produces JSON-safe output', () => {
  document.body.innerHTML = '<section id="s" title="a &quot;quoted&quot; title"><h2></h2><p></p></section>'
  document.querySelector('h2').textContent = 'Tips & tricks'
  document.querySelector('p').textContent = '1 < 2'
  const result = serialize(document.getElementById('s'))
  expect(JSON.parse(JSON.stringify(result))).toEqual(result)
  expect(result.attributes.title).toBe('a "quoted" title')
  expect(result.children[0].children).toEqual(['Tips & tricks'])
  expect(result.children[1].children).toEqual(['1 < 2'])
})

test('does not modify the DOM', () => {
  document.body.innerHTML = '<div id="d">\n  <span>x</span>\n  <!-- c --></div>'
  const before = document.body.innerHTML
  serialize(document.getElementById('d'))
  expect(document.body.innerHTML).toBe(before)
})
