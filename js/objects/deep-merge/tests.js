test('merges nested objects key by key', () => {
  const result = deepMerge({ theme: { mode: 'light', accent: 'blue' } }, { theme: { mode: 'dark' }, lang: 'en' })
  expect(result).toEqual({ theme: { mode: 'dark', accent: 'blue' }, lang: 'en' })
})

test('lets later sources win and accepts any number of sources', () => {
  const result = deepMerge({ a: 1, n: { x: 1 } }, null, { a: 2, n: { y: 2 } }, undefined, { a: 3, n: { z: 3 } })
  expect(result).toEqual({ a: 3, n: { x: 1, y: 2, z: 3 } })
})

test('replaces arrays instead of concatenating them', () => {
  const later = ['vim']
  const result = deepMerge({ plugins: ['git', 'lint'] }, { plugins: later })
  expect(result.plugins).toEqual(['vim'])
  expect(result.plugins).toBe(later)
})

test('replaces when only one side is a plain object', () => {
  expect(deepMerge({ a: 1 }, { a: { b: 1 } })).toEqual({ a: { b: 1 } })
  expect(deepMerge({ a: { b: 1 } }, { a: null })).toEqual({ a: null })
  expect(deepMerge({ a: { b: 1 } }, { a: [1] })).toEqual({ a: [1] })
})

test('ignores undefined in a source but applies null', () => {
  expect(deepMerge({ a: 1, b: 2 }, { a: undefined, b: null })).toEqual({ a: 1, b: null })
})

test('copies dates and class instances by reference without merging into them', () => {
  class Money {
    constructor(cents) { this.cents = cents }
  }
  const first = new window.Date(0)
  const second = new window.Date(1000)
  const price = new Money(5)
  const result = deepMerge({ when: first, price: { cents: 1, currency: 'EUR' } }, { when: second, price })
  expect(result.when).toBe(second)
  expect(result.price).toBe(price)
  expect(price).toEqual({ cents: 5 })
})

test('does not mutate any source', () => {
  const a = { settings: { volume: 5 }, list: [1] }
  const b = { settings: { muted: true } }
  deepMerge(a, b)
  expect(a).toEqual({ settings: { volume: 5 }, list: [1] })
  expect(b).toEqual({ settings: { muted: true } })
})

test('builds new plain objects even for branches from a single source', () => {
  const defaults = { layout: { sidebar: { width: 240 } } }
  const result = deepMerge(defaults, { other: 1 })
  expect(result.layout).not.toBe(defaults.layout)
  result.layout.sidebar.width = 999
  expect(defaults.layout.sidebar.width).toBe(240)
})

test('ignores a __proto__ key coming from JSON.parse', () => {
  try {
    const result = deepMerge({ a: 1 }, JSON.parse('{"__proto__": {"polluted": "yes"}, "b": 2}'))
    expect({}.polluted).toBeUndefined()
    expect(Object.getPrototypeOf(result)).toBe(Object.prototype)
    expect(result.polluted).toBeUndefined()
    expect(result).toEqual({ a: 1, b: 2 })
  } finally {
    delete Object.prototype.polluted
  }
})

test('ignores constructor and prototype keys', () => {
  try {
    const result = deepMerge({}, JSON.parse('{"constructor": {"prototype": {"polluted": "yes"}}, "ok": true}'))
    expect({}.polluted).toBeUndefined()
    expect(Object.keys(result)).toEqual(['ok'])
  } finally {
    delete Object.prototype.polluted
  }
})
