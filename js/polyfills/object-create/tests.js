test('creates an object that inherits from proto', () => {
  const animal = {
    speak() {
      return `${this.name} speaks`
    },
  }
  const dog = objectCreate(animal)
  dog.name = 'Rex'
  expect(Object.getPrototypeOf(dog)).toBe(animal)
  expect(dog.speak()).toBe('Rex speaks')
})

test('the new object has no own properties', () => {
  const proto = { a: 1 }
  const obj = objectCreate(proto)
  expect(Object.getOwnPropertyNames(obj)).toEqual([])
  expect(obj.a).toBe(1)
  expect(obj).not.toBe(proto)
})

test('null creates an object with no prototype', () => {
  const dict = objectCreate(null)
  expect(Object.getPrototypeOf(dict)).toBeNull()
  expect('toString' in dict).toBe(false)
  expect('hasOwnProperty' in dict).toBe(false)
})

test('applies the property descriptors', () => {
  const obj = objectCreate(
    {},
    {
      x: { value: 1, enumerable: true },
      total: {
        get() {
          return this.x + 1
        },
        enumerable: true,
      },
    },
  )
  expect(obj.x).toBe(1)
  expect(obj.total).toBe(2)
  expect(Object.keys(obj)).toEqual(['x', 'total'])
})

test('unspecified descriptor flags default to false', () => {
  const obj = objectCreate(Object.prototype, { hidden: { value: 42 } })
  const d = Object.getOwnPropertyDescriptor(obj, 'hidden')
  expect(d).toEqual({ value: 42, writable: false, enumerable: false, configurable: false })
  expect(Object.keys(obj)).toEqual([])
})

test('accepts functions as the prototype', () => {
  function Base() {}
  Base.tag = 'base'
  const obj = objectCreate(Base)
  expect(obj.tag).toBe('base')
  expect(Object.getPrototypeOf(obj)).toBe(Base)
})

test('throws a TypeError for a primitive or undefined prototype', () => {
  expect(() => objectCreate(undefined)).toThrow(TypeError)
  expect(() => objectCreate(42)).toThrow(TypeError)
  expect(() => objectCreate('proto')).toThrow(TypeError)
})

test('works as the base of prototype inheritance', () => {
  function Shape(name) {
    this.name = name
  }
  Shape.prototype.describe = function () {
    return `I am a ${this.name}`
  }
  function Square() {
    Shape.call(this, 'square')
  }
  Square.prototype = objectCreate(Shape.prototype, {
    constructor: { value: Square, writable: true, configurable: true },
  })
  const s = new Square()
  expect(s.describe()).toBe('I am a square')
  expect(s instanceof Shape).toBe(true)
  expect(s.constructor).toBe(Square)
  expect(Object.keys(Square.prototype)).toEqual([])
})

test('does not rely on Object.create', () => {
  const saved = Object.create
  Object.create = () => {
    throw new Error('used the built-in Object.create')
  }
  let a, b
  try {
    a = objectCreate(null)
    b = objectCreate({ k: 1 }, { own: { value: 2 } })
  } finally {
    Object.create = saved
  }
  expect(Object.getPrototypeOf(a)).toBeNull()
  expect(b.k + b.own).toBe(3)
})
