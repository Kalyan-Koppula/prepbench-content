const matches = (pattern, topic) => {
  const bus = new PubSub()
  bus.subscribe(pattern, () => {})
  return bus.publish(topic) === 1
}

test('delivers data and topic to an exact subscription', () => {
  const bus = new PubSub()
  const handler = fn()
  bus.subscribe('order.created', handler)
  expect(bus.publish('order.created', { id: 9 })).toBe(1)
  expect(handler).toHaveBeenCalledWith({ id: 9 }, 'order.created')
  expect(bus.publish('order.deleted', {})).toBe(0)
})

test('compares whole words, never prefixes', () => {
  expect(matches('user', 'users')).toBe(false)
  expect(matches('user.created', 'user.createdAt')).toBe(false)
  expect(matches('user', 'user.created')).toBe(false)
  expect(matches('user.created', 'user')).toBe(false)
})

test('* matches exactly one word', () => {
  expect(matches('user.*', 'user.created')).toBe(true)
  expect(matches('user.*', 'user')).toBe(false)
  expect(matches('user.*', 'user.profile.updated')).toBe(false)
  expect(matches('*.created', 'order.created')).toBe(true)
  expect(matches('*.*.updated', 'user.profile.updated')).toBe(true)
})

test('# at the end matches zero or more words', () => {
  expect(matches('user.#', 'user')).toBe(true)
  expect(matches('user.#', 'user.created')).toBe(true)
  expect(matches('user.#', 'user.profile.photo.updated')).toBe(true)
  expect(matches('user.#', 'admin.user')).toBe(false)
})

test('# in the middle or at the start matches any number of words', () => {
  expect(matches('user.#.updated', 'user.updated')).toBe(true)
  expect(matches('user.#.updated', 'user.a.b.updated')).toBe(true)
  expect(matches('user.#.updated', 'user.updated.later')).toBe(false)
  expect(matches('#.error', 'error')).toBe(true)
  expect(matches('#.error', 'api.v2.error')).toBe(true)
  expect(matches('a.#.b.#.c', 'a.b.x.b.c')).toBe(true)
  expect(matches('a.#.b.#.c', 'a.x.c')).toBe(false)
})

test('a lone # matches everything and a lone * matches one word', () => {
  expect(matches('#', 'anything')).toBe(true)
  expect(matches('#', 'a.b.c')).toBe(true)
  expect(matches('*', 'one')).toBe(true)
  expect(matches('*', 'one.two')).toBe(false)
})

test('calls matching handlers in subscription order and returns the count', () => {
  const bus = new PubSub()
  const calls = []
  bus.subscribe('#', () => calls.push('all'))
  bus.subscribe('user.*', () => calls.push('user.*'))
  bus.subscribe('order.*', () => calls.push('order.*'))
  bus.subscribe('user.created', () => calls.push('exact'))
  expect(bus.publish('user.created')).toBe(3)
  expect(calls).toEqual(['all', 'user.*', 'exact'])
})

test('the same handler subscribed twice is called twice', () => {
  const bus = new PubSub()
  const handler = fn()
  bus.subscribe('a.*', handler)
  bus.subscribe('a.#', handler)
  expect(bus.publish('a.b')).toBe(2)
  expect(handler).toHaveBeenCalledTimes(2)
})

test('unsubscribing removes only that subscription', () => {
  const bus = new PubSub()
  const a = fn()
  const b = fn()
  const stopA = bus.subscribe('x.#', a)
  bus.subscribe('x.#', b)
  stopA()
  expect(bus.publish('x.y')).toBe(1)
  expect(a).not.toHaveBeenCalled()
  expect(b).toHaveBeenCalledTimes(1)
})

test('subscriptions added during a publish wait for the next publish', () => {
  const bus = new PubSub()
  const late = fn()
  bus.subscribe('ping', () => bus.subscribe('ping', late))
  expect(bus.publish('ping')).toBe(1)
  expect(late).not.toHaveBeenCalled()
  bus.publish('ping')
  expect(late).toHaveBeenCalledTimes(1)
})
