test('copies own enumerable properties and returns the target', () => {
  const target = { a: 1 }
  const out = objectAssign(target, { b: 2 }, { c: 3 })
  expect(out).toBe(target)
  expect(target).toEqual({ a: 1, b: 2, c: 3 })
})

test('later sources overwrite earlier ones', () => {
  expect(objectAssign({}, { x: 1, y: 1 }, { y: 2 }, { y: 3 })).toEqual({ x: 1, y: 3 })
})

test('skips null and undefined sources, throws for a null target', () => {
  expect(objectAssign({ a: 1 }, null, undefined, { b: 2 })).toEqual({ a: 1, b: 2 })
  expect(() => objectAssign(null, { a: 1 })).toThrow(TypeError)
  expect(() => objectAssign(undefined)).toThrow(TypeError)
})

test('boxes primitives: strings copy indices, numbers copy nothing', () => {
  expect(objectAssign({}, 'ab', 7, true)).toEqual({ 0: 'a', 1: 'b' })
  const boxed = objectAssign(1, { extra: 'yes' })
  expect(typeof boxed).toBe('object')
  expect(boxed.extra).toBe('yes')
  expect(boxed.valueOf()).toBe(1)
})

test('ignores inherited and non-enumerable properties', () => {
  const source = Object.create({ inherited: true })
  source.own = 1
  Object.defineProperty(source, 'hidden', { value: 2, enumerable: false })
  const out = objectAssign({}, source)
  expect(Object.keys(out)).toEqual(['own'])
  expect('hidden' in out).toBe(false)
})

test('copies enumerable symbol keys only', () => {
  const visible = Symbol('visible')
  const hidden = Symbol('hidden')
  const source = { [visible]: 'v' }
  Object.defineProperty(source, hidden, { value: 'h', enumerable: false })
  const out = objectAssign({}, source)
  expect(out[visible]).toBe('v')
  expect(Object.getOwnPropertySymbols(out)).toEqual([visible])
})

test('invokes source getters and copies their value', () => {
  let reads = 0
  const source = {
    get now() {
      reads++
      return 'value'
    },
  }
  const out = objectAssign({}, source)
  expect(reads).toBe(1)
  const desc = Object.getOwnPropertyDescriptor(out, 'now')
  expect(desc.value).toBe('value')
  expect(desc.get).toBeUndefined()
})

test('triggers setters on the target', () => {
  const seen = []
  const target = {
    set name(v) {
      seen.push(v)
    },
  }
  objectAssign(target, { name: 'Ada' })
  expect(seen).toEqual(['Ada'])
  expect(Object.getOwnPropertyDescriptor(target, 'name').set).toBeDefined()
})

test('does not rely on Object.assign', () => {
  const saved = Object.assign
  Object.assign = () => {
    throw new Error('used the built-in Object.assign')
  }
  let out
  try {
    out = objectAssign({ a: 1 }, { b: 2 })
  } finally {
    Object.assign = saved
  }
  expect(out).toEqual({ a: 1, b: 2 })
})
