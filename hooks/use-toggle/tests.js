import { renderHook, render, screen, fireEvent, act } from '@testing-library/react'
import { useToggle } from './useToggle'

test('defaults to false and respects an initial value', () => {
  expect(renderHook(() => useToggle()).result.current[0]).toBe(false)
  expect(renderHook(() => useToggle(true)).result.current[0]).toBe(true)
})

test('toggle() flips the value each time', () => {
  const { result } = renderHook(() => useToggle())
  act(() => result.current[1]())
  expect(result.current[0]).toBe(true)
  act(() => result.current[1]())
  expect(result.current[0]).toBe(false)
})

test('toggle(true) and toggle(false) set the value explicitly', () => {
  const { result } = renderHook(() => useToggle())
  act(() => result.current[1](true))
  act(() => result.current[1](true))
  expect(result.current[0]).toBe(true)
  act(() => result.current[1](false))
  expect(result.current[0]).toBe(false)
})

test('works when passed directly as an onClick handler', () => {
  function Panel() {
    const [open, toggle] = useToggle()
    return <button onClick={toggle}>{open ? 'open' : 'closed'}</button>
  }
  render(<Panel />)
  fireEvent.click(screen.getByRole('button'))
  expect(screen.getByRole('button').textContent).toBe('open')
  fireEvent.click(screen.getByRole('button'))
  expect(screen.getByRole('button').textContent).toBe('closed')
})

test('two toggles in one update flip twice', () => {
  const { result } = renderHook(() => useToggle())
  act(() => {
    result.current[1]()
    result.current[1]()
    result.current[1]()
  })
  expect(result.current[0]).toBe(true)
})

test('toggle keeps the same identity across renders', () => {
  const { result } = renderHook(() => useToggle())
  const first = result.current[1]
  act(() => result.current[1]())
  act(() => result.current[1]())
  expect(result.current[1]).toBe(first)
})
