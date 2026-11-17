function setup(html) {
  document.body.innerHTML = `<div id="root">${html}</div>`
  return document.getElementById('root')
}

test('wraps a match and returns the number of marks', () => {
  const root = setup('<p>The quick brown fox</p>')
  expect(highlight(root, ['quick'])).toBe(1)
  expect(root.innerHTML).toBe('<p>The <mark>quick</mark> brown fox</p>')
})

test('matches case-insensitively and keeps the original text', () => {
  const root = setup('<p>Cat, CAT and cAt</p>')
  expect(highlight(root, ['cat'])).toBe(3)
  expect(root.innerHTML).toBe('<p><mark>Cat</mark>, <mark>CAT</mark> and <mark>cAt</mark></p>')
})

test('searches text in nested elements', () => {
  const root = setup('red <b>and red <i>again red</i></b>')
  expect(highlight(root, ['red'])).toBe(3)
  expect(root.innerHTML).toBe('<mark>red</mark> <b>and <mark>red</mark> <i>again <mark>red</mark></i></b>')
})

test('never touches tag names or attributes', () => {
  const root = setup('<a href="/cat" title="cat" class="cat">my cat</a><cat-card data-cat="cat"></cat-card>')
  expect(highlight(root, ['cat'])).toBe(1)
  expect(root.innerHTML).toBe('<a href="/cat" title="cat" class="cat">my <mark>cat</mark></a><cat-card data-cat="cat"></cat-card>')
})

test('keeps existing elements and their listeners', () => {
  const root = setup('<button>save the cat</button>')
  const button = root.firstChild
  const onClick = fn()
  button.addEventListener('click', onClick)
  highlight(root, ['cat'])
  expect(root.firstChild).toBe(button)
  button.dispatchEvent(new window.Event('click'))
  expect(onClick).toHaveBeenCalledTimes(1)
})

test('prefers the longest keyword at the same position', () => {
  const root = setup('<p>JavaScript is not Java</p>')
  expect(highlight(root, ['java', 'javascript'])).toBe(2)
  expect(root.innerHTML).toBe('<p><mark>JavaScript</mark> is not <mark>Java</mark></p>')
})

test('treats keywords as literal text', () => {
  const root = setup('<p>c++ or cxx, .net or anet, (a)</p>')
  expect(highlight(root, ['c++', '.net', '(a)'])).toBe(3)
  expect(root.innerHTML).toBe('<p><mark>c++</mark> or cxx, <mark>.net</mark> or anet, <mark>(a)</mark></p>')
})

test('treats text as text, even when it looks like markup', () => {
  const root = setup('<p></p>')
  root.firstChild.textContent = 'use <b> for bold'
  expect(highlight(root, ['b'])).toBe(2)
  expect(root.innerHTML).toBe('<p>use &lt;<mark>b</mark>&gt; for <mark>b</mark>old</p>')
})

test('skips script and style contents', () => {
  const root = setup('<style>.dog { color: red }</style><p>dog</p><script>var dog = 1</script>')
  expect(highlight(root, ['dog'])).toBe(1)
  expect(root.querySelector('style').textContent).toBe('.dog { color: red }')
  expect(root.querySelector('script').textContent).toBe('var dog = 1')
})

test('running twice does not nest marks', () => {
  const root = setup('<p>one sun, two suns</p>')
  expect(highlight(root, ['sun'])).toBe(2)
  const once = root.innerHTML
  expect(highlight(root, ['sun'])).toBe(0)
  expect(root.innerHTML).toBe(once)
})

test('ignores empty keywords', () => {
  const root = setup('<p>abc</p>')
  expect(highlight(root, [])).toBe(0)
  expect(highlight(root, [''])).toBe(0)
  expect(root.innerHTML).toBe('<p>abc</p>')
  expect(highlight(root, ['', 'b'])).toBe(1)
  expect(root.innerHTML).toBe('<p>a<mark>b</mark>c</p>')
})
