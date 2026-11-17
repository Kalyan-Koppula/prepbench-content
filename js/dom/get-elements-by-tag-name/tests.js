const ids = (els) => els.map((el) => el.id)

function withoutBuiltIns(run) {
  const banned = ['getElementsByClassName', 'getElementsByTagName', 'querySelector', 'querySelectorAll']
  const saved = []
  for (const start of [document.body, document]) {
    for (let proto = Object.getPrototypeOf(start); proto; proto = Object.getPrototypeOf(proto)) {
      for (const name of banned) {
        if (!Object.prototype.hasOwnProperty.call(proto, name)) continue
        saved.push([proto, name, proto[name]])
        proto[name] = () => {
          throw new Error(`don't call the built-in ${name}`)
        }
      }
    }
  }
  try {
    return run()
  } finally {
    for (const [proto, name, original] of saved.reverse()) proto[name] = original
  }
}

test('finds every matching descendant', () => {
  document.body.innerHTML = '<div id="root"><p id="a">1</p><span>x</span><p id="b">2</p></div>'
  const result = getElementsByTagName(document.getElementById('root'), 'p')
  expect(Array.isArray(result)).toBe(true)
  expect(ids(result)).toEqual(['a', 'b'])
})

test('ignores the case of the tag name', () => {
  document.body.innerHTML = '<div id="root"><li id="a"></li><li id="b"></li></div>'
  const root = document.getElementById('root')
  expect(ids(getElementsByTagName(root, 'LI'))).toEqual(['a', 'b'])
  expect(ids(getElementsByTagName(root, 'Li'))).toEqual(['a', 'b'])
})

test('returns nested matches in document order', () => {
  document.body.innerHTML = `
    <div id="root">
      <div id="d1"><div id="d2"><span></span><div id="d3"></div></div></div>
      <div id="d4"></div>
    </div>`
  expect(ids(getElementsByTagName(document.getElementById('root'), 'div'))).toEqual(['d1', 'd2', 'd3', 'd4'])
})

test('excludes the root even when it matches', () => {
  document.body.innerHTML = '<section id="root"><section id="child"></section></section>'
  expect(ids(getElementsByTagName(document.getElementById('root'), 'section'))).toEqual(['child'])
})

test('* matches every element but no text or comments', () => {
  document.body.innerHTML = '<ul id="root">hi<!-- c --><li id="a"><b id="b">x</b></li><li id="c"></li></ul>'
  expect(ids(getElementsByTagName(document.getElementById('root'), '*'))).toEqual(['a', 'b', 'c'])
})

test('works with custom element names', () => {
  document.body.innerHTML = '<main id="root"><user-card id="u1"></user-card><div><user-card id="u2"></user-card></div><user-cards></user-cards></main>'
  expect(ids(getElementsByTagName(document.getElementById('root'), 'user-card'))).toEqual(['u1', 'u2'])
})

test('returns an empty array when nothing matches', () => {
  document.body.innerHTML = '<div id="root"><p></p></div>'
  expect(getElementsByTagName(document.getElementById('root'), 'table')).toEqual([])
})

test('does not call the built-in lookups', () => {
  document.body.innerHTML = '<div id="root"><a id="a"></a><p><a id="b"></a></p></div>'
  const root = document.getElementById('root')
  expect(ids(withoutBuiltIns(() => getElementsByTagName(root, 'a')))).toEqual(['a', 'b'])
})
