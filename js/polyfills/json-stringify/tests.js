// Expected strings come from the real JSON.stringify, called outside the guard.
const same = (v) => expect(jsonStringify(v)).toBe(JSON.stringify(v))

test('serializes primitives', () => {
  for (const v of [0, -0, 42, -3.25, 1e21, 5e-7, 'hi', '', true, false, null]) same(v)
})

test('NaN and Infinity become null', () => {
  expect(jsonStringify(NaN)).toBe('null')
  expect(jsonStringify([Infinity, -Infinity])).toBe('[null,null]')
})

test('escapes quotes, backslashes and control characters', () => {
  same('say "hi" \\ path')
  same('line\nbreak\ttab\rcr\bbs\fff')
  same('\u0000\u0001\u001f\u007f end')
  same('unicode é ü 😀 stays')
  same({ 'we"ird\nkey': 1 })
})

test('arrays: undefined, functions, symbols and holes become null', () => {
  same([1, 'a', undefined, () => {}, Symbol('s'), , null])
  same([])
})

test('objects: undefined, functions and symbols are omitted', () => {
  same({ a: 1, u: undefined, f() {}, s: Symbol('x'), n: null, [Symbol('key')]: 'ignored' })
  same({})
})

test('top-level undefined, functions and symbols give undefined', () => {
  expect(jsonStringify(undefined)).toBeUndefined()
  expect(jsonStringify(() => 1)).toBeUndefined()
  expect(jsonStringify(Symbol('s'))).toBeUndefined()
})

test('serializes nested structures in key order', () => {
  same({ z: 1, a: [1, { b: [2, [3, { c: 'd' }]] }], m: { n: { o: {} } }, 2: 'two', 1: 'one' })
  const proto = { inherited: true }
  const child = Object.create(proto)
  child.own = 'yes'
  Object.defineProperty(child, 'hidden', { value: 1, enumerable: false })
  same(child)
})

test('calls toJSON with the key and serializes its result', () => {
  const spy = fn(function (key) {
    return { from: key }
  })
  const value = { p: { toJSON: spy }, list: [{ toJSON: spy }] }
  expect(jsonStringify(value)).toBe('{"p":{"from":"p"},"list":[{"from":"0"}]}')
  expect(jsonStringify({ toJSON: (k) => `top:${k}` })).toBe('"top:"')
  expect(jsonStringify({ gone: { toJSON: () => undefined } })).toBe('{}')
})

test('dates serialize through toJSON', () => {
  same({ when: new Date(Date.UTC(2024, 1, 29, 12, 30)) })
  same([new Date(0)])
})

test('throws a TypeError on cycles but allows shared references', () => {
  const shared = { v: 1 }
  same({ a: shared, b: [shared, shared] })
  const loop = { name: 'loop' }
  loop.self = { back: loop }
  expect(() => jsonStringify(loop)).toThrow(TypeError)
  const arr = [1]
  arr.push(arr)
  expect(() => jsonStringify(arr)).toThrow(TypeError)
})

test('throws a TypeError for BigInt', () => {
  expect(() => jsonStringify({ big: 10n })).toThrow(TypeError)
})

test('does not rely on JSON.stringify', () => {
  const value = { a: [1, 'x', null, undefined], b: { c: true, d: 'q"' } }
  const expected = JSON.stringify(value)
  const saved = JSON.stringify
  JSON.stringify = () => {
    throw new Error('used the built-in JSON.stringify')
  }
  let out
  try {
    out = jsonStringify(value)
  } finally {
    JSON.stringify = saved
  }
  expect(out).toBe(expected)
})
