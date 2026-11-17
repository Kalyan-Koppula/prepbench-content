beforeEach(() => {
  Object.defineProperty(Function.prototype, 'myBind', { value: myBind, configurable: true, writable: true })
})

function whoAndWhat() {
  return [this && this.id, Array.from(arguments)]
}

test('returns a new function without calling the target', () => {
  const spy = fn()
  const bound = spy.myBind({})
  expect(typeof bound).toBe('function')
  expect(bound).not.toBe(spy)
  expect(spy).not.toHaveBeenCalled()
})

test('binds `this` and returns the result', () => {
  const bound = whoAndWhat.myBind({ id: 'a' })
  expect(bound()).toEqual(['a', []])
})

test('puts preset arguments before call arguments', () => {
  const bound = whoAndWhat.myBind({ id: 'a' }, 1, 2)
  expect(bound(3, 4)).toEqual(['a', [1, 2, 3, 4]])
  expect(bound(5)).toEqual(['a', [1, 2, 5]])
})

test('the bound `this` cannot be overridden', () => {
  const bound = whoAndWhat.myBind({ id: 'a' })
  const other = { id: 'b', m: bound }
  expect(other.m()[0]).toBe('a')
  expect(bound.call({ id: 'c' })[0]).toBe('a')
  expect(bound.apply({ id: 'd' }, [])[0]).toBe('a')
})

test('binding again keeps the first `this` and adds presets', () => {
  const twice = whoAndWhat.myBind({ id: 'first' }, 1).myBind({ id: 'second' }, 2)
  expect(twice(3)).toEqual(['first', [1, 2, 3]])
})

test('`new` creates an instance of the target and ignores the bound `this`', () => {
  function Point(x, y) {
    this.x = x
    this.y = y
  }
  Point.prototype.sum = function () {
    return this.x + this.y
  }
  const ctx = {}
  const AtX1 = Point.myBind(ctx, 1)
  const p = new AtX1(2)
  expect(p instanceof Point).toBe(true)
  expect(p.x).toBe(1)
  expect(p.y).toBe(2)
  expect(p.sum()).toBe(3)
  expect(Object.keys(ctx)).toEqual([])
})

test('`new` returns an object the target returns', () => {
  const custom = { custom: true }
  function Factory() {
    this.ignored = true
    return custom
  }
  function Primitive() {
    this.kept = true
    return 42
  }
  expect(new (Factory.myBind(null))()).toBe(custom)
  const made = new (Primitive.myBind(null))()
  expect(made.kept).toBe(true)
  expect(made instanceof Primitive).toBe(true)
})

test('throws a TypeError when not called on a function', () => {
  expect(() => myBind.call({}, null)).toThrow(TypeError)
  expect(() => myBind.call(42, null)).toThrow(TypeError)
})

test('does not rely on the built-in bind', () => {
  const saved = Object.getOwnPropertyDescriptor(Function.prototype, 'bind')
  Object.defineProperty(Function.prototype, 'bind', {
    value: () => {
      throw new Error('used the built-in bind')
    },
    configurable: true,
    writable: true,
  })
  let result
  try {
    result = whoAndWhat.myBind({ id: 'z' }, 'p')('q')
  } finally {
    Object.defineProperty(Function.prototype, 'bind', saved)
  }
  expect(result).toEqual(['z', ['p', 'q']])
})
