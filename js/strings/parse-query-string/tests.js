test('parses simple pairs, with or without a leading ?', () => {
  expect(parseQuery('page=2&sort=price')).toEqual({ page: '2', sort: 'price' })
  expect(parseQuery('?page=2&sort=price')).toEqual({ page: '2', sort: 'price' })
})

test('collects repeated keys into an array in order', () => {
  expect(parseQuery('tag=js&tag=css&lang=en&tag=html')).toEqual({ tag: ['js', 'css', 'html'], lang: 'en' })
})

test('turns + into a space and decodes percent escapes', () => {
  expect(parseQuery('q=red+running%20shoes&city=S%C3%A3o+Paulo&ok=%E2%9C%93')).toEqual({
    q: 'red running shoes',
    city: 'São Paulo',
    ok: '✓',
  })
})

test('an encoded plus stays a plus', () => {
  expect(parseQuery('expr=1%2B1+%3D+2')).toEqual({ expr: '1+1 = 2' })
})

test('decodes keys too', () => {
  expect(parseQuery('first%20name=Ana&a%26b=1')).toEqual({ 'first name': 'Ana', 'a&b': '1' })
})

test('splits each pair on the first = only', () => {
  expect(parseQuery('token=ab==&next=/cart?step=2')).toEqual({ token: 'ab==', next: '/cart?step=2' })
})

test('missing values become empty strings', () => {
  expect(parseQuery('debug&empty=&x=1')).toEqual({ debug: '', empty: '', x: '1' })
})

test('skips empty pieces and empty keys', () => {
  expect(parseQuery('&&a=1&&=orphan&b=2&')).toEqual({ a: '1', b: '2' })
  expect(parseQuery('')).toEqual({})
  expect(parseQuery('?')).toEqual({})
})

test('keeps malformed escapes as raw text', () => {
  expect(parseQuery('discount=100%&bad=%E0%A4%A+x')).toEqual({ discount: '100%', bad: '%E0%A4%A x' })
})

test('treats __proto__ as an ordinary key', () => {
  const result = parseQuery('__proto__=hacked&a=1&__proto__=again')
  expect(Object.keys(result)).toEqual(['__proto__', 'a'])
  expect(Object.getOwnPropertyDescriptor(result, '__proto__').value).toEqual(['hacked', 'again'])
  expect({}.hacked).toBeUndefined()
})
