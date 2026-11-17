import { useRef } from 'react'
import { renderHook, render, screen, fireEvent, act } from '@testing-library/react'
import { useEventListener } from './useEventListener'

test('listens on window when no target is given', () => {
  const handler = jest.fn()
  renderHook(() => useEventListener('app:ping', handler))
  const event = new Event('app:ping')
  act(() => {
    window.dispatchEvent(event)
  })
  expect(handler).toHaveBeenCalledTimes(1)
  expect(handler).toHaveBeenCalledWith(event)
})

test('listens on the element behind a ref', () => {
  const handler = jest.fn()
  function Box() {
    const ref = useRef(null)
    useEventListener('click', handler, ref)
    return <div ref={ref}>box</div>
  }
  render(<Box />)
  fireEvent.click(document.body)
  expect(handler).not.toHaveBeenCalled()
  fireEvent.click(screen.getByText('box'))
  expect(handler).toHaveBeenCalledTimes(1)
})

test('accepts document or an element directly', () => {
  const handler = jest.fn()
  renderHook(() => useEventListener('keydown', handler, document))
  fireEvent.keyDown(document, { key: 'Escape' })
  expect(handler).toHaveBeenCalledTimes(1)
  expect(handler.mock.calls[0][0].key).toBe('Escape')
})

test('calls the latest handler without re-subscribing', () => {
  const add = jest.spyOn(window, 'addEventListener')
  const remove = jest.spyOn(window, 'removeEventListener')
  try {
    const first = jest.fn()
    const second = jest.fn()
    const { rerender } = renderHook(({ fn }) => useEventListener('app:tick', fn), { initialProps: { fn: first } })
    rerender({ fn: second })
    rerender({ fn: second })
    act(() => {
      window.dispatchEvent(new Event('app:tick'))
    })
    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledTimes(1)
    expect(add.mock.calls.filter((c) => c[0] === 'app:tick')).toHaveLength(1)
    expect(remove.mock.calls.filter((c) => c[0] === 'app:tick')).toHaveLength(0)
  } finally {
    add.mockRestore()
    remove.mockRestore()
  }
})

test('moves the listener when the event name changes', () => {
  const handler = jest.fn()
  const { rerender } = renderHook(({ name }) => useEventListener(name, handler), { initialProps: { name: 'app:a' } })
  rerender({ name: 'app:b' })
  act(() => {
    window.dispatchEvent(new Event('app:a'))
  })
  expect(handler).not.toHaveBeenCalled()
  act(() => {
    window.dispatchEvent(new Event('app:b'))
  })
  expect(handler).toHaveBeenCalledTimes(1)
})

test('removes the listener on unmount, including capture listeners', () => {
  const plain = jest.fn()
  const captured = jest.fn()
  const a = renderHook(() => useEventListener('app:bye', plain))
  const b = renderHook(() => useEventListener('app:bye', captured, window, { capture: true }))
  a.unmount()
  b.unmount()
  window.dispatchEvent(new Event('app:bye'))
  expect(plain).not.toHaveBeenCalled()
  expect(captured).not.toHaveBeenCalled()
})

test('does nothing when the ref is empty', () => {
  const handler = jest.fn()
  expect(() => renderHook(() => useEventListener('click', handler, { current: null }))).not.toThrow()
  fireEvent.click(document.body)
  expect(handler).not.toHaveBeenCalled()
})
