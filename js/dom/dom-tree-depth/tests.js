function chain(depth) {
  const top = document.createElement('div')
  let cur = top
  for (let i = 1; i < depth; i++) cur = cur.appendChild(document.createElement('div'))
  return { top, bottom: cur }
}

test('a single element has depth 1', () => {
  expect(getTreeDepth(document.createElement('span'))).toBe(1)
})

test('counts the root and every level below it', () => {
  document.body.innerHTML = '<div id="r"><section><p><b>x</b></p></section></div>'
  expect(getTreeDepth(document.getElementById('r'))).toBe(4)
})

test('follows the deepest branch, wherever it is', () => {
  document.body.innerHTML = `
    <div id="r">
      <p>shallow</p>
      <div><div><div><i>deep</i></div></div></div>
      <ul><li>mid</li></ul>
    </div>`
  expect(getTreeDepth(document.getElementById('r'))).toBe(5)
})

test('text and comment nodes do not add a level', () => {
  document.body.innerHTML = '<div id="r">hello<!-- note --><p>text only</p></div>'
  expect(getTreeDepth(document.getElementById('r'))).toBe(2)
})

test('returns 0 for a missing root', () => {
  expect(getTreeDepth(null)).toBe(0)
  expect(getTreeDepth(undefined)).toBe(0)
})

test('measures from the given element, not the document', () => {
  document.body.innerHTML = '<div><div><div id="r"><p><b></b></p></div></div></div>'
  expect(getTreeDepth(document.getElementById('r'))).toBe(3)
})

test('handles wide trees', () => {
  const root = document.createElement('ul')
  for (let i = 0; i < 2000; i++) root.appendChild(document.createElement('li'))
  root.children[1500].appendChild(document.createElement('span'))
  expect(getTreeDepth(root)).toBe(3)
})

test('handles a tree several thousand levels deep', () => {
  const { top, bottom } = chain(3000)
  bottom.appendChild(document.createTextNode('leaf'))
  expect(getTreeDepth(top)).toBe(3000)
})
