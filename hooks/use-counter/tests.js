import { renderHook, act } from '@testing-library/react'
import { useCounter } from './useCounter'

test('starts at the initial value (0 by default)', () => {
  expect(renderHook(() => useCounter()).result.current.count).toBe(0)
  expect(renderHook(() => useCounter(7)).result.current.count).toBe(7)
})

test('increment and decrement move by step', () => {
  const { result } = renderHook(() => useCounter(10, { step: 5 }))
  act(() => result.current.increment())
  expect(result.current.count).toBe(15)
  act(() => result.current.decrement())
  act(() => result.current.decrement())
  expect(result.current.count).toBe(5)
})

test('several increments in one update all count', () => {
  const { result } = renderHook(() => useCounter(0, { step: 2 }))
  act(() => {
    result.current.increment()
    result.current.increment()
    result.current.increment()
  })
  expect(result.current.count).toBe(6)
})

test('never goes past max or below min', () => {
  const { result } = renderHook(() => useCounter(2, { min: 0, max: 3 }))
  act(() => {
    result.current.increment()
    result.current.increment()
    result.current.increment()
  })
  expect(result.current.count).toBe(3)
  act(() => {
    for (let i = 0; i < 6; i++) result.current.decrement()
  })
  expect(result.current.count).toBe(0)
})

test('clamps the initial value and values passed to set', () => {
  const { result } = renderHook(() => useCounter(50, { min: 1, max: 10 }))
  expect(result.current.count).toBe(10)
  act(() => result.current.set(-4))
  expect(result.current.count).toBe(1)
  act(() => result.current.set(6))
  expect(result.current.count).toBe(6)
})

test('reset goes back to the initial value', () => {
  const { result } = renderHook(() => useCounter(4))
  act(() => result.current.increment())
  act(() => result.current.increment())
  act(() => result.current.reset())
  expect(result.current.count).toBe(4)
})

test('uses bounds and step from the latest render', () => {
  const { result, rerender } = renderHook(({ opts }) => useCounter(0, opts), { initialProps: { opts: { max: 100 } } })
  rerender({ opts: { max: 4, step: 3 } })
  act(() => result.current.increment())
  expect(result.current.count).toBe(3)
  act(() => result.current.increment())
  expect(result.current.count).toBe(4)
})
