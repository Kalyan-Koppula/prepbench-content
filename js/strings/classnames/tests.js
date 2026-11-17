test('joins strings with single spaces', () => {
  expect(classNames('card', 'card--wide', 'shadow')).toBe('card card--wide shadow')
})

test('includes object keys whose values are truthy', () => {
  expect(classNames({ open: true, hidden: false, active: 1, empty: '', label: 'yes' })).toBe('open active label')
})

test('skips every falsy argument', () => {
  expect(classNames(null, 'a', undefined, false, 0, '', NaN, 'b')).toBe('a b')
})

test('includes non-zero numbers', () => {
  expect(classNames('col', 12, -1)).toBe('col 12 -1')
})

test('flattens nested arrays', () => {
  expect(classNames(['a', ['b', ['c', [null, 'd']]]], 'e')).toBe('a b c d e')
})

test('handles objects inside arrays, keeping order', () => {
  expect(classNames('x', [{ y: true, z: false }, 'w'], { v: 1 })).toBe('x y w v')
})

test('ignores true and functions', () => {
  expect(classNames(true, 'kept', () => 'nope')).toBe('kept')
})

test('ignores inherited properties', () => {
  const props = Object.create({ inherited: true })
  props.own = true
  expect(classNames(props)).toBe('own')
})

test('returns an empty string when nothing applies', () => {
  expect(classNames()).toBe('')
  expect(classNames(null, [], {}, [false, { a: 0 }])).toBe('')
})

test('keeps duplicates', () => {
  expect(classNames('a', { a: true }, ['a'])).toBe('a a a')
})
