test('calls listeners in registration order with the emitted arguments', () => {
  const e = new EventEmitter()
  const order = []
  e.on('save', (a, b) => order.push(['first', a, b]))
  e.on('save', (a, b) => order.push(['second', a, b]))
  e.emit('save', 'doc', 3)
  expect(order).toEqual([['first', 'doc', 3], ['second', 'doc', 3]])
})

test('emit returns whether any listener ran', () => {
  const e = new EventEmitter()
  expect(e.emit('nothing')).toBe(false)
  const spy = fn()
  e.on('ping', spy)
  expect(e.emit('ping')).toBe(true)
  e.off('ping', spy)
  expect(e.emit('ping')).toBe(false)
})

test('keeps events separate and calls listeners with this = emitter', () => {
  const e = new EventEmitter()
  const a = fn()
  const b = fn()
  e.on('a', a)
  e.on('b', b)
  e.emit('a', 1)
  expect(a).toHaveBeenCalledWith(1)
  expect(b).not.toHaveBeenCalled()
  expect(a.mock.contexts[0]).toBe(e)
})

test('the function returned by on removes that registration', () => {
  const e = new EventEmitter()
  const spy = fn()
  const stop = e.on('tick', spy)
  stop()
  stop()
  e.emit('tick')
  expect(spy).not.toHaveBeenCalled()
})

test('a function registered twice runs twice and off removes one registration', () => {
  const e = new EventEmitter()
  const spy = fn()
  e.on('x', spy)
  e.on('x', spy)
  e.emit('x')
  expect(spy).toHaveBeenCalledTimes(2)
  e.off('x', spy)
  e.emit('x')
  expect(spy).toHaveBeenCalledTimes(3)
  e.off('missing', spy)
})

test('once listeners run a single time', () => {
  const e = new EventEmitter()
  const spy = fn()
  e.once('ready', spy)
  expect(e.emit('ready', 'a')).toBe(true)
  expect(e.emit('ready', 'b')).toBe(false)
  expect(spy.mock.calls).toEqual([['a']])
})

test('a once listener that re-emits its own event still runs once', () => {
  const e = new EventEmitter()
  const spy = fn(() => e.emit('load'))
  e.once('load', spy)
  e.emit('load')
  expect(spy).toHaveBeenCalledTimes(1)
})

test('off removes a once listener before it fires', () => {
  const e = new EventEmitter()
  const spy = fn()
  e.once('done', spy)
  e.off('done', spy)
  expect(e.emit('done')).toBe(false)
  expect(spy).not.toHaveBeenCalled()
})

test('listeners added during an emit wait for the next emit', () => {
  const e = new EventEmitter()
  const late = fn()
  e.on('msg', () => e.on('msg', late))
  e.emit('msg')
  expect(late).not.toHaveBeenCalled()
  e.emit('msg')
  expect(late).toHaveBeenCalledTimes(1)
})

test('a listener removing itself during an emit does not skip the next one', () => {
  const e = new EventEmitter()
  const calls = []
  const first = () => {
    calls.push('first')
    e.off('go', first)
  }
  e.on('go', first)
  e.on('go', () => calls.push('second'))
  e.on('go', () => calls.push('third'))
  e.emit('go')
  e.emit('go')
  expect(calls).toEqual(['first', 'second', 'third', 'second', 'third'])
})

test('a listener removed mid-emit still runs this time, then never again', () => {
  const e = new EventEmitter()
  const victim = fn()
  e.on('go', () => e.off('go', victim))
  e.on('go', victim)
  e.emit('go')
  e.emit('go')
  expect(victim).toHaveBeenCalledTimes(1)
})
