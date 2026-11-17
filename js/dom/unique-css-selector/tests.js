function check(el, expected) {
  const selector = getUniqueSelector(el)
  expect(selector).toBe(expected)
  const matches = document.querySelectorAll(selector)
  expect(matches.length).toBe(1)
  expect(matches[0]).toBe(el)
}

beforeEach(() => {
  document.body.innerHTML = `
    <main>
      <ul><li>Milk</li> <li>Eggs</li></ul>
      <ul><li>Bread</li></ul>
    </main>
    <footer id="contact"><p>Email</p><a>Call</a></footer>`
})

test('uses the id when the element has one', () => {
  check(document.getElementById('contact'), '#contact')
})

test('a tag that is unique in the document is enough', () => {
  check(document.querySelector('a'), 'a')
  check(document.querySelector('main'), 'main')
})

test('adds :nth-child when a sibling shares the tag', () => {
  check(document.querySelectorAll('li')[1], 'li:nth-child(2)')
})

test('climbs to the parent until the selector is unique', () => {
  check(document.querySelectorAll('li')[0], 'ul:nth-child(1) > li:nth-child(1)')
})

test('leaves out :nth-child for an only child of its tag', () => {
  check(document.querySelectorAll('li')[2], 'ul:nth-child(2) > li')
})

test('stops at an ancestor with an id', () => {
  document.body.innerHTML = '<div id="menu"><span>a</span><span>b</span></div><div><span>c</span><span>d</span></div>'
  check(document.querySelector('#menu span'), '#menu > span:nth-child(1)')
})

test('counts every element sibling, ignoring text and comments', () => {
  document.body.innerHTML = '<article><h2>T</h2> text <!-- c --> <p>one</p><p>two</p></article><aside><p>x</p><p>y</p><p>z</p></aside>'
  check(document.querySelectorAll('article p')[1], 'article > p:nth-child(3)')
})

test('ignores classes', () => {
  document.body.innerHTML = '<section><b class="only-one">x</b><b>y</b></section><section><b>z</b><i>w</i></section>'
  const selector = getUniqueSelector(document.querySelector('.only-one'))
  expect(selector).not.toContain('.')
  check(document.querySelector('.only-one'), 'section:nth-child(1) > b:nth-child(1)')
})

test('climbs several levels when needed', () => {
  document.body.innerHTML = `
    <div><div><span>a</span><span>b</span></div><div><span>c</span><span>d</span></div></div>
    <div><div><span>e</span><span>f</span></div></div>`
  const f = document.querySelectorAll('span')[5]
  check(f, 'div:nth-child(2) > div > span:nth-child(2)')
})

test('handles body itself', () => {
  check(document.body, 'body')
})
