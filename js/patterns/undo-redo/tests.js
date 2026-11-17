test('starts at the initial value with nothing to undo or redo', () => {
  const h = new History({ text: '' })
  expect(h.value).toEqual({ text: '' })
  expect(h.canUndo()).toBe(false)
  expect(h.canRedo()).toBe(false)
})

test('push changes the value and makes undo available', () => {
  const h = new History(0)
  h.push(1)
  expect(h.value).toBe(1)
  expect(h.canUndo()).toBe(true)
})

test('undo walks back one step at a time and returns the value', () => {
  const h = new History('a')
  h.push('ab')
  h.push('abc')
  expect(h.undo()).toBe('ab')
  expect(h.undo()).toBe('a')
  expect(h.value).toBe('a')
  expect(h.canUndo()).toBe(false)
})

test('redo replays undone steps in order', () => {
  const h = new History(1)
  h.push(2)
  h.push(3)
  h.undo()
  h.undo()
  expect(h.canRedo()).toBe(true)
  expect(h.redo()).toBe(2)
  expect(h.redo()).toBe(3)
  expect(h.canRedo()).toBe(false)
})

test('undo and redo at the ends change nothing', () => {
  const h = new History('x')
  expect(h.undo()).toBe('x')
  expect(h.redo()).toBe('x')
  h.push('y')
  expect(h.redo()).toBe('y')
  h.undo()
  expect(h.undo()).toBe('x')
  expect(h.redo()).toBe('y')
})

test('pushing after an undo clears the redo steps', () => {
  const h = new History('H')
  h.push('Hi')
  h.push('Hi!')
  h.undo()
  h.undo()
  h.push('Ho')
  expect(h.canRedo()).toBe(false)
  expect(h.redo()).toBe('Ho')
  expect(h.undo()).toBe('H')
})

test('pushing the current value again is ignored', () => {
  const state = { n: 1 }
  const h = new History(state)
  h.push({ n: 2 })
  h.undo()
  h.push(state)
  expect(h.canRedo()).toBe(true)
  h.push(NaN)
  h.push(NaN)
  expect(h.undo()).toBe(state)
  expect(h.canUndo()).toBe(false)
})

test('keeps only the newest undo steps when a limit is set', () => {
  const h = new History(0, { limit: 2 })
  h.push(1)
  h.push(2)
  h.push(3)
  expect(h.undo()).toBe(2)
  expect(h.undo()).toBe(1)
  expect(h.canUndo()).toBe(false)
  expect(h.undo()).toBe(1)
  expect(h.redo()).toBe(2)
  expect(h.redo()).toBe(3)
})

test('a limit of 0 keeps no undo steps', () => {
  const h = new History('a', { limit: 0 })
  h.push('b')
  expect(h.value).toBe('b')
  expect(h.canUndo()).toBe(false)
  expect(h.undo()).toBe('b')
})
