import { renderHook, render, screen, fireEvent } from '@testing-library/react'
import { useKeyPress } from './useKeyPress'

const press = (key, mods = {}, target = document.body) => fireEvent.keyDown(target, { key, ...mods })

test('fires for a single key and ignores others', () => {
  const handler = jest.fn()
  renderHook(() => useKeyPress('Escape', handler))
  press('Enter')
  expect(handler).not.toHaveBeenCalled()
  press('Escape')
  expect(handler).toHaveBeenCalledTimes(1)
  expect(handler.mock.calls[0][0].key).toBe('Escape')
})

test('requires the exact modifiers', () => {
  const handler = jest.fn()
  renderHook(() => useKeyPress('ctrl+k', handler))
  press('k')
  press('k', { ctrlKey: true, shiftKey: true })
  press('k', { metaKey: true })
  expect(handler).not.toHaveBeenCalled()
  press('k', { ctrlKey: true })
  expect(handler).toHaveBeenCalledTimes(1)
})

test('compares keys case-insensitively', () => {
  const handler = jest.fn()
  renderHook(() => useKeyPress('meta+shift+p', handler))
  press('P', { metaKey: true, shiftKey: true })
  expect(handler).toHaveBeenCalledTimes(1)
})

test('accepts an array of combos', () => {
  const handler = jest.fn()
  renderHook(() => useKeyPress(['meta+k', 'ctrl+k'], handler))
  press('k', { metaKey: true })
  press('k', { ctrlKey: true })
  press('k', { altKey: true })
  expect(handler).toHaveBeenCalledTimes(2)
})

test('ignores typing in form fields unless enableInInputs is set', () => {
  const plain = jest.fn()
  const everywhere = jest.fn()
  function Form() {
    useKeyPress('/', plain)
    useKeyPress('/', everywhere, { enableInInputs: true })
    return (
      <form>
        <input aria-label="name" />
        <textarea aria-label="bio" />
      </form>
    )
  }
  render(<Form />)
  press('/', {}, screen.getByLabelText('name'))
  press('/', {}, screen.getByLabelText('bio'))
  expect(plain).not.toHaveBeenCalled()
  expect(everywhere).toHaveBeenCalledTimes(2)
  press('/')
  expect(plain).toHaveBeenCalledTimes(1)
})

test('calls preventDefault only when asked and only on a match', () => {
  // events are built with the DOM window's own constructor so they can be dispatched on its nodes
  renderHook(() => useKeyPress('ctrl+s', () => {}, { preventDefault: true }))
  renderHook(() => useKeyPress('ctrl+p', () => {}))
  const save = new window.KeyboardEvent('keydown', { key: 's', ctrlKey: true, bubbles: true, cancelable: true })
  const print = new window.KeyboardEvent('keydown', { key: 'p', ctrlKey: true, bubbles: true, cancelable: true })
  const other = new window.KeyboardEvent('keydown', { key: 'x', ctrlKey: true, bubbles: true, cancelable: true })
  document.body.dispatchEvent(save)
  document.body.dispatchEvent(print)
  document.body.dispatchEvent(other)
  expect(save.defaultPrevented).toBe(true)
  expect(print.defaultPrevented).toBe(false)
  expect(other.defaultPrevented).toBe(false)
})

test('uses the latest handler and stops after unmount', () => {
  const first = jest.fn()
  const second = jest.fn()
  const { rerender, unmount } = renderHook(({ fn }) => useKeyPress('?', fn), { initialProps: { fn: first } })
  rerender({ fn: second })
  press('?')
  expect(first).not.toHaveBeenCalled()
  expect(second).toHaveBeenCalledTimes(1)
  unmount()
  press('?')
  expect(second).toHaveBeenCalledTimes(1)
})
