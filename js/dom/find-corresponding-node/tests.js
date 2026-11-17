function twoTrees(html) {
  document.body.innerHTML = `<div id="a">${html}</div><section><div id="b">${html.replace(/id="/g, 'data-x="')}</div></section>`
  return { a: document.getElementById('a'), b: document.getElementById('b') }
}

test('finds the element at the same position', () => {
  const { a, b } = twoTrees('<ul><li>1</li><li><span id="t">2</span></li></ul>')
  const found = findCorrespondingNode(a, b, document.getElementById('t'))
  expect(found).toBe(b.firstChild.childNodes[1].firstChild)
})

test('does not rely on ids, classes or text', () => {
  document.body.innerHTML = `
    <div id="a"><p class="x">first</p><p class="y" id="t">second</p></div>
    <div id="b"><p class="y">uno</p><p class="x">dos</p></div>`
  const b = document.getElementById('b')
  const found = findCorrespondingNode(document.getElementById('a'), b, document.getElementById('t'))
  expect(found).toBe(b.children[1])
  expect(found.textContent).toBe('dos')
})

test('finds elements among text and comment siblings', () => {
  const { a, b } = twoTrees('text<!-- note --><em>x</em><em id="t">y</em>')
  const found = findCorrespondingNode(a, b, document.getElementById('t'))
  expect(found).toBe(b.childNodes[3])
})

test('works when the target is a text node', () => {
  const { a, b } = twoTrees('<p>hello <b>bold</b> world</p>')
  const target = a.firstChild.lastChild
  const found = findCorrespondingNode(a, b, target)
  expect(found).toBe(b.firstChild.lastChild)
  expect(found.nodeType).toBe(3)
})

test('returns rootB when the target is rootA', () => {
  const { a, b } = twoTrees('<p></p>')
  expect(findCorrespondingNode(a, b, a)).toBe(b)
})

test('returns null when the target is outside rootA', () => {
  document.body.innerHTML = '<div id="a"><p></p></div><div id="b"><p></p></div><p id="other"></p>'
  const result = findCorrespondingNode(document.getElementById('a'), document.getElementById('b'), document.getElementById('other'))
  expect(result).toBeNull()
})

test('returns null for a node that is not attached anywhere', () => {
  const { a, b } = twoTrees('<p></p>')
  expect(findCorrespondingNode(a, b, document.createElement('p'))).toBeNull()
})

test('handles deep trees at different document depths', () => {
  let html = '<i id="t">leaf</i>'
  for (let i = 0; i < 30; i++) html = `<div><span></span>${html}</div>`
  const { a, b } = twoTrees(html)
  let expected = b.firstChild
  for (let i = 0; i < 30; i++) expected = expected.childNodes[1]
  const found = findCorrespondingNode(a, b, document.getElementById('t'))
  expect(found).toBe(expected)
  expect(found.textContent).toBe('leaf')
})
