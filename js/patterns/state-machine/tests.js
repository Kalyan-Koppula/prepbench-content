const light = () =>
  createMachine({
    initial: 'green',
    states: {
      green: { on: { TIMER: 'yellow' } },
      yellow: { on: { TIMER: 'red' } },
      red: { on: { TIMER: 'green' } },
    },
  })

test('starts in the initial state and runs its entry action', () => {
  const entry = fn()
  const m = createMachine({ initial: 'idle', context: { n: 1 }, states: { idle: { entry } } })
  expect(m.state).toBe('idle')
  expect(entry).toHaveBeenCalledWith({ n: 1 }, undefined)
})

test('moves along string transitions and returns the new state', () => {
  const m = light()
  expect(m.send('TIMER')).toBe('yellow')
  expect(m.send('TIMER')).toBe('red')
  expect(m.send('TIMER')).toBe('green')
  expect(m.state).toBe('green')
})

test('ignores events the current state does not handle', () => {
  const m = light()
  expect(m.send('PANIC')).toBe('green')
  expect(m.state).toBe('green')
})

test('runs exit, action and entry in that order with context and payload', () => {
  const log = []
  const m = createMachine({
    initial: 'a',
    context: { id: 7 },
    states: {
      a: { exit: (ctx, p) => log.push(['exit a', ctx.id, p]), on: { GO: { target: 'b', action: (ctx, p) => log.push(['action', ctx.id, p]) } } },
      b: { entry: (ctx, p) => log.push(['entry b', ctx.id, p]) },
    },
  })
  m.send('GO', 'payload')
  expect(log).toEqual([['exit a', 7, 'payload'], ['action', 7, 'payload'], ['entry b', 7, 'payload']])
})

test('a failing guard blocks the transition', () => {
  const exit = fn()
  const m = createMachine({
    initial: 'form',
    states: {
      form: { exit, on: { SUBMIT: { target: 'sent', guard: (ctx, data) => data.email.includes('@') } } },
      sent: {},
    },
  })
  expect(m.send('SUBMIT', { email: 'nope' })).toBe('form')
  expect(exit).not.toHaveBeenCalled()
  expect(m.send('SUBMIT', { email: 'a@b.c' })).toBe('sent')
})

test('takes the first candidate whose guard passes', () => {
  const m = createMachine({
    initial: 'checking',
    context: { score: 72 },
    states: {
      checking: {
        on: {
          GRADE: [
            { target: 'distinction', guard: (ctx) => ctx.score >= 85 },
            { target: 'pass', guard: (ctx) => ctx.score >= 50 },
            'fail',
          ],
        },
      },
      distinction: {},
      pass: {},
      fail: {},
    },
  })
  expect(m.send('GRADE')).toBe('pass')
})

test('a self-transition exits and re-enters the state', () => {
  const entry = fn()
  const exit = fn()
  const m = createMachine({ initial: 'on', states: { on: { entry, exit, on: { RESET: 'on' } } } })
  m.send('RESET')
  expect(exit).toHaveBeenCalledTimes(1)
  expect(entry).toHaveBeenCalledTimes(2)
})

test('a transition without a target only runs its action', () => {
  const entry = fn()
  const exit = fn()
  const m = createMachine({
    initial: 'counting',
    context: { count: 0 },
    states: { counting: { entry, exit, on: { INC: { action: (ctx, by) => (ctx.count += by) } } } },
  })
  expect(m.send('INC', 2)).toBe('counting')
  m.send('INC', 3)
  expect(m.context.count).toBe(5)
  expect(exit).not.toHaveBeenCalled()
  expect(entry).toHaveBeenCalledTimes(1)
})

test('guards see the context as updated by earlier actions', () => {
  const m = createMachine({
    initial: 'failure',
    context: { retries: 0 },
    states: {
      failure: { on: { RETRY: { target: 'loading', guard: (ctx) => ctx.retries < 2, action: (ctx) => ctx.retries++ } } },
      loading: { on: { FAIL: 'failure' } },
    },
  })
  m.send('RETRY')
  m.send('FAIL')
  m.send('RETRY')
  m.send('FAIL')
  expect(m.send('RETRY')).toBe('failure')
  expect(m.context.retries).toBe(2)
})

test('can() answers without running anything', () => {
  const action = fn()
  const m = createMachine({
    initial: 'locked',
    states: { locked: { on: { UNLOCK: { target: 'open', guard: (ctx, code) => code === 1234, action } } }, open: {} },
  })
  expect(m.can('UNLOCK', 1111)).toBe(false)
  expect(m.can('UNLOCK', 1234)).toBe(true)
  expect(m.can('KICK')).toBe(false)
  expect(action).not.toHaveBeenCalled()
  expect(m.state).toBe('locked')
})

test('rejects configs that point at unknown states', () => {
  expect(() => createMachine({ initial: 'nowhere', states: { a: {} } })).toThrow(Error)
  expect(() => createMachine({ initial: 'a', states: { a: { on: { GO: 'b' } } } })).toThrow(Error)
  expect(() => createMachine({ initial: 'a', states: { a: { on: { GO: [{ target: 'a', guard: () => false }, { target: 'zz' }] } } } })).toThrow(Error)
})
