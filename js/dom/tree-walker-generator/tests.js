// Short labels: tag names for elements, the text for text nodes, !comment for comments.
const label = (n) => (n.nodeType === 1 ? n.tagName.toLowerCase() : n.nodeType === 3 ? n.data : '!' + n.data)
const labels = (iterable) => Array.from(iterable, label)

beforeEach(() => {
  document.body.innerHTML = '<div id="r"><p>a<b>b</b></p><!--c--><ul><li>d</li><li><i>e</i></li></ul>f</div>'
})

test('returns a generator', () => {
  const it = walk(document.getElementById('r'))
  expect(typeof it.next).toBe('function')
  expect(it[Symbol.iterator]()).toBe(it)
})

test('visits every node depth-first by default, starting with the root', () => {
  expect(labels(walk(document.getElementById('r')))).toEqual(['div', 'p', 'a', 'b', 'b', '!c', 'ul', 'li', 'd', 'li', 'i', 'e', 'f'])
})

test('visits level by level in breadth order', () => {
  expect(labels(walk(document.getElementById('r'), { order: 'breadth' }))).toEqual(['div', 'p', '!c', 'ul', 'f', 'a', 'b', 'li', 'li', 'b', 'd', 'i', 'e'])
})

test('a single text node yields just itself', () => {
  expect(labels(walk(document.createTextNode('solo')))).toEqual(['solo'])
})

test('skip hides a node but keeps its children', () => {
  const onlyText = (n) => (n.nodeType === 3 ? 'accept' : 'skip')
  expect(labels(walk(document.getElementById('r'), { filter: onlyText }))).toEqual(['a', 'b', 'd', 'e', 'f'])
  expect(labels(walk(document.getElementById('r'), { order: 'breadth', filter: onlyText }))).toEqual(['f', 'a', 'b', 'd', 'e'])
})

test('reject prunes the whole subtree', () => {
  const noLists = (n) => (n.nodeType === 1 && n.tagName === 'UL' ? 'reject' : 'accept')
  expect(labels(walk(document.getElementById('r'), { filter: noLists }))).toEqual(['div', 'p', 'a', 'b', 'b', '!c', 'f'])
  expect(labels(walk(document.getElementById('r'), { order: 'breadth', filter: noLists }))).toEqual(['div', 'p', '!c', 'f', 'a', 'b', 'b'])
})

test('rejecting the root yields nothing', () => {
  const filter = fn(() => 'reject')
  expect(labels(walk(document.getElementById('r'), { filter }))).toEqual([])
  expect(filter).toHaveBeenCalledTimes(1)
})

test('never calls the filter for nodes under a rejected one', () => {
  const filter = fn((n) => (n.nodeType === 1 && n.tagName === 'P' ? 'reject' : 'accept'))
  Array.from(walk(document.getElementById('r'), { filter }))
  const seen = filter.mock.calls.map(([n]) => label(n))
  expect(seen).not.toContain('a')
  expect(seen).not.toContain('b')
  expect(seen).toContain('p')
})

test('is lazy: the filter runs only as far as the caller reads', () => {
  const filter = fn(() => 'accept')
  const it = walk(document.getElementById('r'), { filter })
  expect(filter).not.toHaveBeenCalled()
  expect(label(it.next().value)).toBe('div')
  expect(filter).toHaveBeenCalledTimes(1)
  it.next()
  it.next()
  expect(filter).toHaveBeenCalledTimes(3)
})

test('stopping early leaves the rest unvisited', () => {
  const filter = fn((n) => (n.nodeType === 1 ? 'accept' : 'skip'))
  let first = null
  for (const node of walk(document.getElementById('r'), { filter, order: 'breadth' })) {
    if (node.tagName === 'UL') {
      first = node
      break
    }
  }
  expect(first.tagName).toBe('UL')
  expect(filter.mock.calls.map(([n]) => label(n))).toEqual(['div', 'p', '!c', 'ul'])
})

test('independent walks do not share state', () => {
  const root = document.getElementById('r')
  const a = walk(root)
  const b = walk(root)
  a.next()
  a.next()
  expect(label(b.next().value)).toBe('div')
  expect(label(a.next().value)).toBe('a')
})
