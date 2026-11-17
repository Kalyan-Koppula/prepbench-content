test('replaces a simple placeholder', () => {
  expect(renderTemplate('Hello, {{ name }}!', { name: 'Riya' })).toBe('Hello, Riya!')
})

test('whitespace inside the braces is optional', () => {
  expect(renderTemplate('{{a}}-{{  a  }}-{{ a}}', { a: 'x' })).toBe('x-x-x')
})

test('follows nested paths and array indices', () => {
  const data = { order: { items: [{ sku: 'K-1' }, { sku: 'K-2' }], ship: { city: 'Pune' } } }
  expect(renderTemplate('{{ order.items.1.sku }} to {{ order.ship.city }}', data)).toBe('K-2 to Pune')
})

test('renders missing and null values as empty strings', () => {
  const data = { a: null, b: { c: undefined } }
  expect(renderTemplate('[{{ a }}][{{ b.c }}][{{ nope }}][{{ a.deep.path }}][{{ b.c.d }}]', data)).toBe('[][][][][]')
})

test('renders 0 and false', () => {
  expect(renderTemplate('{{ n }} {{ flag }}', { n: 0, flag: false })).toBe('0 false')
})

test('escapes values but not the template', () => {
  const data = { name: `<script>alert("x")</script>`, company: "Tom & Jerry's" }
  expect(renderTemplate('<b>{{ name }}</b> at {{ company }}', data)).toBe(
    '<b>&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;</b> at Tom &amp; Jerry&#39;s',
  )
})

test('triple braces insert the raw value', () => {
  expect(renderTemplate('{{{ html }}} vs {{ html }}', { html: '<i>hi</i>' })).toBe('<i>hi</i> vs &lt;i&gt;hi&lt;/i&gt;')
})

test('ignores inherited properties', () => {
  expect(renderTemplate('[{{ toString }}][{{ user.constructor }}]', { user: {} })).toBe('[][]')
})

test('handles repeated and adjacent placeholders', () => {
  expect(renderTemplate('{{x}}{{y}}{{x}}', { x: 1, y: 2 })).toBe('121')
})

test('leaves invalid placeholders untouched', () => {
  const template = 'a {{ }} b {{ two words }} c {{ open'
  expect(renderTemplate(template, { two: 'nope', open: 'nope' })).toBe(template)
})

test('returns text without placeholders unchanged', () => {
  expect(renderTemplate('Just {text} & {single} braces', {})).toBe('Just {text} & {single} braces')
})
