const ids = (els) => els.map((el) => el.id)

function withoutSelectorEngine(run) {
  const banned = ['querySelector', 'querySelectorAll', 'matches', 'closest', 'getElementsByClassName', 'getElementsByTagName']
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

const PAGE = `
  <header id="h" class="top">
    <nav id="nav" class="menu open">
      <a id="a1" class="link">Home</a>
      <ul id="ul1"><li id="li1" class="item active"><a id="a2" class="link">Docs</a></li><li id="li2" class="item"><a id="a3">Blog</a></li></ul>
    </nav>
  </header>
  <main id="m">
    <section id="s1" class="card"><p id="p1">One <span id="sp1" class="item">x</span></p></section>
    <section id="s2" class="card wide"><div id="d1"><p id="p2" class="Item">Two</p></div></section>
  </main>`

beforeEach(() => {
  document.body.innerHTML = PAGE
})

test('matches a tag name, ignoring its case', () => {
  const result = withoutSelectorEngine(() => querySelectorAllLite(document.body, 'P'))
  expect(Array.isArray(result)).toBe(true)
  expect(ids(result)).toEqual(['p1', 'p2'])
})

test('matches classes and ids case-sensitively', () => {
  withoutSelectorEngine(() => {
    expect(ids(querySelectorAllLite(document.body, '.item'))).toEqual(['li1', 'li2', 'sp1'])
    expect(ids(querySelectorAllLite(document.body, '#d1'))).toEqual(['d1'])
    expect(ids(querySelectorAllLite(document.body, '#D1'))).toEqual([])
  })
})

test('matches compound selectors in any order', () => {
  withoutSelectorEngine(() => {
    expect(ids(querySelectorAllLite(document.body, 'li.item.active'))).toEqual(['li1'])
    expect(ids(querySelectorAllLite(document.body, '.active.item'))).toEqual(['li1'])
    expect(ids(querySelectorAllLite(document.body, 'section.card.wide'))).toEqual(['s2'])
    expect(ids(querySelectorAllLite(document.body, '.open#nav'))).toEqual(['nav'])
    expect(ids(querySelectorAllLite(document.body, 'div.card'))).toEqual([])
  })
})

test('supports the descendant combinator across several levels', () => {
  withoutSelectorEngine(() => {
    expect(ids(querySelectorAllLite(document.body, 'nav a'))).toEqual(['a1', 'a2', 'a3'])
    expect(ids(querySelectorAllLite(document.body, '#nav ul .item a.link'))).toEqual(['a2'])
    expect(ids(querySelectorAllLite(document.body, 'main .card p'))).toEqual(['p1', 'p2'])
  })
})

test('respects the order of the compounds', () => {
  document.body.innerHTML = '<div class="b" id="x"><div class="a" id="y"><span class="c" id="z"></span></div></div>'
  withoutSelectorEngine(() => {
    expect(ids(querySelectorAllLite(document.body, '.b .a .c'))).toEqual(['z'])
    expect(ids(querySelectorAllLite(document.body, '.a .b .c'))).toEqual([])
    expect(ids(querySelectorAllLite(document.body, '.c .c'))).toEqual([])
  })
})

test('never returns the root and lists each match once', () => {
  document.body.innerHTML = '<div id="r" class="box"><div id="i1" class="box"><div id="i2" class="box"></div></div></div>'
  const root = document.getElementById('r')
  withoutSelectorEngine(() => {
    expect(ids(querySelectorAllLite(root, '.box'))).toEqual(['i1', 'i2'])
    expect(ids(querySelectorAllLite(root, '.box .box'))).toEqual(['i1', 'i2'])
    expect(ids(querySelectorAllLite(document.body, 'div div'))).toEqual(['i1', 'i2'])
  })
})

test('lets ancestors outside the root satisfy the combinator, like the native method', () => {
  const s2 = document.getElementById('s2')
  withoutSelectorEngine(() => {
    expect(ids(querySelectorAllLite(s2, 'main p'))).toEqual(['p2'])
    expect(ids(querySelectorAllLite(s2, 'section p'))).toEqual(['p2'])
    expect(ids(querySelectorAllLite(s2, 'header p'))).toEqual([])
  })
})

test('supports * and tolerates extra whitespace', () => {
  withoutSelectorEngine(() => {
    expect(ids(querySelectorAllLite(document.getElementById('ul1'), '*'))).toEqual(['li1', 'a2', 'li2', 'a3'])
    expect(ids(querySelectorAllLite(document.body, '  ul \n  *.item   a  '))).toEqual(['a2', 'a3'])
  })
})

test('agrees with the native querySelectorAll on many selectors', () => {
  const selectors = ['a', 'li a', 'header li', 'main *', '.card', 'section p span', '#m .card', 'nav .item a', 'ul li.item', '* p', 'body section', '.top .link', 'div p.Item']
  for (const root of [document.body, document.getElementById('m'), document.getElementById('nav')]) {
    for (const sel of selectors) {
      const expected = ids(Array.from(root.querySelectorAll(sel)))
      const actual = ids(withoutSelectorEngine(() => querySelectorAllLite(root, sel)))
      expect(`${root.id || 'body'} ${sel}: ${actual.join(',')}`).toBe(`${root.id || 'body'} ${sel}: ${expected.join(',')}`)
    }
  }
})
