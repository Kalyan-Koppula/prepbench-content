const tag = (t) => (s) => s + t

test('pipe runs functions left to right', () => {
  expect(pipe(tag('a'), tag('b'), tag('c'))('>')).toBe('>abc')
})

test('compose runs functions right to left', () => {
  expect(compose(tag('a'), tag('b'), tag('c'))('>')).toBe('>cba')
})

test('the first function to run receives every argument', () => {
  const add = (a, b, c) => a + b + c
  const double = (x) => x * 2
  expect(pipe(add, double)(1, 2, 3)).toBe(12)
  expect(compose(double, add)(1, 2, 3)).toBe(12)
})

test('later functions receive only the previous result', () => {
  const second = fn((x) => x)
  pipe((a, b) => a * b, second)(3, 4)
  expect(second.mock.calls).toEqual([[12]])
})

test('no functions means identity', () => {
  expect(pipe()(5)).toBe(5)
  expect(compose()('x', 'y')).toBe('x')
})

test('a single function is just called', () => {
  const spy = fn((a, b) => a - b)
  expect(compose(spy)(10, 4)).toBe(6)
  expect(pipe(spy)(10, 4)).toBe(6)
  expect(spy).toHaveBeenCalledTimes(2)
})

test('passes `this` to every function', () => {
  const obj = {
    factor: 3,
    run: pipe(
      function (x) {
        return x + this.factor
      },
      function (x) {
        return x * this.factor
      },
    ),
  }
  expect(obj.run(1)).toBe(12)
})

test('is reusable and calls each function once per run', () => {
  const a = fn((x) => x + 1)
  const b = fn((x) => x * 10)
  const c = compose(b, a)
  expect(c(1)).toBe(20)
  expect(c(2)).toBe(30)
  expect(a).toHaveBeenCalledTimes(2)
  expect(b).toHaveBeenCalledTimes(2)
  expect(pipe(b, a)(1)).toBe(11)
})
