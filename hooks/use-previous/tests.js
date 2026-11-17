import { renderHook, render, screen } from '@testing-library/react'
import { usePrevious } from './usePrevious'

test('returns undefined on the first render', () => {
  const { result } = renderHook(() => usePrevious('first'))
  expect(result.current).toBeUndefined()
})

test('returns the value from before the latest change', () => {
  const { result, rerender } = renderHook(({ v }) => usePrevious(v), { initialProps: { v: 5 } })
  rerender({ v: 8 })
  expect(result.current).toBe(5)
  rerender({ v: 3 })
  expect(result.current).toBe(8)
})

test('unrelated re-renders keep the previous value', () => {
  const { result, rerender } = renderHook(({ v }) => usePrevious(v), { initialProps: { v: 'a' } })
  rerender({ v: 'b' })
  rerender({ v: 'b' })
  rerender({ v: 'b' })
  expect(result.current).toBe('a')
})

test('tracks falsy values such as 0, empty string and null', () => {
  const { result, rerender } = renderHook(({ v }) => usePrevious(v), { initialProps: { v: 0 } })
  rerender({ v: '' })
  expect(result.current).toBe(0)
  rerender({ v: null })
  expect(result.current).toBe('')
})

test('treats NaN as unchanged and objects by identity', () => {
  const a = { id: 1 }
  const { result, rerender } = renderHook(({ v }) => usePrevious(v), { initialProps: { v: NaN } })
  rerender({ v: a })
  rerender({ v: a })
  expect(result.current).toBeNaN()
  rerender({ v: { id: 1 } })
  expect(result.current).toBe(a)
})

test('is correct in the rendered output, not one render late', () => {
  function Score({ n }) {
    const prev = usePrevious(n)
    return <p>{`${prev ?? 'none'} -> ${n}`}</p>
  }
  const { rerender } = render(<Score n={1} />)
  expect(screen.getByText('none -> 1')).toBeTruthy()
  rerender(<Score n={2} />)
  expect(screen.getByText('1 -> 2')).toBeTruthy()
  rerender(<Score n={2} />)
  expect(screen.getByText('1 -> 2')).toBeTruthy()
})
