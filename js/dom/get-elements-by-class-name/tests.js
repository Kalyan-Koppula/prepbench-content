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

test('returns matching descendants in document order', () => {
  document.body.innerHTML = `
    <div id="root">
      <p id="a" class="item"><span id="b" class="item">x</span></p>
      <p id="c">y</p>
      <ul><li id="d" class="item">z</li></ul>
    </div>`
  const result = getElementsByClassName(document.getElementById('root'), 'item')
  expect(Array.isArray(result)).toBe(true)
  expect(ids(result)).toEqual(['a', 'b', 'd'])
})

test('requires every listed class, in any order', () => {
  document.body.innerHTML = `
    <section id="root">
      <a id="one" class="link active">1</a>
      <a id="two" class="link">2</a>
      <a id="three" class="extra active link">3</a>
      <a id="four" class="active">4</a>
    </section>`
  expect(ids(getElementsByClassName(document.getElementById('root'), 'active link'))).toEqual(['one', 'three'])
})

test('never includes the root itself', () => {
  document.body.innerHTML = '<div id="root" class="card"><div id="inner" class="card"></div></div>'
  expect(ids(getElementsByClassName(document.getElementById('root'), 'card'))).toEqual(['inner'])
})

test('matches whole class names, not substrings', () => {
  document.body.innerHTML = '<div id="root"><b id="x" class="btn-primary">a</b><b id="y" class="mybtn">b</b><b id="z" class="btn">c</b></div>'
  expect(ids(getElementsByClassName(document.getElementById('root'), 'btn'))).toEqual(['z'])
})

test('is case-sensitive', () => {
  document.body.innerHTML = '<div id="root"><i id="lower" class="note"></i><i id="upper" class="Note"></i></div>'
  expect(ids(getElementsByClassName(document.getElementById('root'), 'Note'))).toEqual(['upper'])
})

test('tolerates extra whitespace in the class list', () => {
  document.body.innerHTML = '<div id="root"><p id="p" class="  a\n  b "></p><p id="q" class="a"></p></div>'
  expect(ids(getElementsByClassName(document.getElementById('root'), '\t b   a\n'))).toEqual(['p'])
})

test('returns an empty array for an empty class list', () => {
  document.body.innerHTML = '<div id="root"><p class="a"></p></div>'
  expect(getElementsByClassName(document.getElementById('root'), '')).toEqual([])
  expect(getElementsByClassName(document.getElementById('root'), '   ')).toEqual([])
})

test('searches deeply and skips text and comment nodes', () => {
  document.body.innerHTML =
    '<div id="root">text<!-- note --><div><div><div><em id="deep" class="hit">x</em></div></div></div><span id="late" class="hit"></span></div>'
  expect(ids(getElementsByClassName(document.getElementById('root'), 'hit'))).toEqual(['deep', 'late'])
})

test('does not call the built-in lookups', () => {
  document.body.innerHTML = '<div id="root"><p id="a" class="k"></p><p><b id="b" class="k"></b></p></div>'
  const root = document.getElementById('root')
  expect(ids(withoutBuiltIns(() => getElementsByClassName(root, 'k')))).toEqual(['a', 'b'])
})
