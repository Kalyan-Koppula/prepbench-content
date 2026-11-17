test('a signal holds a value that can be read and written', () => {
  const count = signal(1)
  expect(count.value).toBe(1)
  count.value = 5
  expect(count.value).toBe(5)
})

test('computed is lazy, cached, and follows its sources', () => {
  const count = signal(2)
  const calc = fn(() => count.value * 10)
  const tenfold = computed(calc)
  expect(calc).not.toHaveBeenCalled()
  expect(tenfold.value).toBe(20)
  expect(tenfold.value).toBe(20)
  expect(calc).toHaveBeenCalledTimes(1)
  count.value = 3
  expect(calc).toHaveBeenCalledTimes(1)
  expect(tenfold.value).toBe(30)
  expect(calc).toHaveBeenCalledTimes(2)
})

test('effect runs immediately and after every change it depends on', () => {
  const name = signal('Ada')
  const seen = []
  effect(() => seen.push(name.value))
  name.value = 'Lin'
  name.value = 'Sam'
  expect(seen).toEqual(['Ada', 'Lin', 'Sam'])
})

test('writing an equal value does nothing', () => {
  const n = signal(NaN)
  const run = fn(() => n.value)
  effect(run)
  n.value = NaN
  expect(run).toHaveBeenCalledTimes(1)
  n.value = 1
  n.value = 1
  expect(run).toHaveBeenCalledTimes(2)
})

test('computeds can depend on computeds', () => {
  const price = signal(10)
  const qty = signal(2)
  const subtotal = computed(() => price.value * qty.value)
  const total = computed(() => subtotal.value + 5)
  expect(total.value).toBe(25)
  qty.value = 3
  expect(total.value).toBe(35)
})

test('a diamond reruns each node once per write and never glitches', () => {
  const a = signal(1)
  const bCalc = fn(() => a.value + 1)
  const cCalc = fn(() => a.value * 2)
  const b = computed(bCalc)
  const c = computed(cCalc)
  const seen = []
  effect(() => seen.push(`${b.value},${c.value}`))
  a.value = 5
  expect(seen).toEqual(['2,2', '6,10'])
  expect(bCalc).toHaveBeenCalledTimes(2)
  expect(cCalc).toHaveBeenCalledTimes(2)
})

test('an unchanged computed result does not rerun its dependents', () => {
  const count = signal(2)
  const parity = computed(() => (count.value % 2 === 0 ? 'even' : 'odd'))
  const run = fn(() => parity.value)
  effect(run)
  count.value = 4
  count.value = 6
  expect(run).toHaveBeenCalledTimes(1)
  count.value = 7
  expect(run).toHaveBeenCalledTimes(2)
})

test('dependencies follow the branch taken in the latest run', () => {
  const useA = signal(true)
  const a = signal('a1')
  const b = signal('b1')
  const run = fn(() => (useA.value ? a.value : b.value))
  effect(run)
  b.value = 'b2'
  expect(run).toHaveBeenCalledTimes(1)
  useA.value = false
  expect(run).toHaveBeenCalledTimes(2)
  a.value = 'a2'
  expect(run).toHaveBeenCalledTimes(2)
  b.value = 'b3'
  expect(run).toHaveBeenCalledTimes(3)
})

test('disposing an effect stops it', () => {
  const s = signal(0)
  const run = fn(() => s.value)
  const stop = effect(run)
  stop()
  s.value = 1
  expect(run).toHaveBeenCalledTimes(1)
})

test('an effect can write signals that other effects depend on', () => {
  const celsius = signal(0)
  const fahrenheit = signal(32)
  const seen = []
  effect(() => {
    fahrenheit.value = celsius.value * 1.8 + 32
  })
  effect(() => seen.push(fahrenheit.value))
  celsius.value = 100
  expect(seen).toEqual([32, 212])
  expect(fahrenheit.value).toBe(212)
})
