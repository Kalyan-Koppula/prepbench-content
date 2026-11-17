import { renderHook, act } from '@testing-library/react'
import { useArray } from './useArray'

test('starts with the initial array (empty by default)', () => {
  expect(renderHook(() => useArray()).result.current.array).toEqual([])
  expect(renderHook(() => useArray([1, 2])).result.current.array).toEqual([1, 2])
})

test('push appends one or more items without mutating', () => {
  const { result } = renderHook(() => useArray(['a']))
  const before = result.current.array
  act(() => result.current.push('b', 'c'))
  expect(result.current.array).toEqual(['a', 'b', 'c'])
  expect(before).toEqual(['a'])
})

test('several pushes in one update all land', () => {
  const { result } = renderHook(() => useArray([]))
  act(() => {
    result.current.push(1)
    result.current.push(2)
    result.current.push(3)
  })
  expect(result.current.array).toEqual([1, 2, 3])
})

test('remove and update change only the item at the index', () => {
  const { result } = renderHook(() => useArray(['x', 'y', 'z']))
  const before = result.current.array
  act(() => result.current.update(1, 'Y'))
  expect(result.current.array).toEqual(['x', 'Y', 'z'])
  act(() => result.current.remove(0))
  expect(result.current.array).toEqual(['Y', 'z'])
  expect(before).toEqual(['x', 'y', 'z'])
})

test('chained removes in one update use the latest array', () => {
  const { result } = renderHook(() => useArray([10, 20, 30, 40]))
  act(() => {
    result.current.remove(0)
    result.current.remove(0)
  })
  expect(result.current.array).toEqual([30, 40])
})

test('out-of-range indexes are ignored and keep the same reference', () => {
  const { result } = renderHook(() => useArray([1, 2]))
  const before = result.current.array
  act(() => {
    result.current.remove(5)
    result.current.remove(-1)
    result.current.update(2, 99)
  })
  expect(result.current.array).toBe(before)
})

test('clear empties and set replaces', () => {
  const { result } = renderHook(() => useArray([1, 2, 3]))
  act(() => result.current.clear())
  expect(result.current.array).toEqual([])
  act(() => result.current.set([7, 8]))
  expect(result.current.array).toEqual([7, 8])
})

test('helpers keep the same identity across renders', () => {
  const { result } = renderHook(() => useArray([]))
  const { set, push, remove, update, clear } = result.current
  act(() => push(1))
  act(() => update(0, 2))
  expect(result.current.set).toBe(set)
  expect(result.current.push).toBe(push)
  expect(result.current.remove).toBe(remove)
  expect(result.current.update).toBe(update)
  expect(result.current.clear).toBe(clear)
})
