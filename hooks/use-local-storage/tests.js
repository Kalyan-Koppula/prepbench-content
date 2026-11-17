import { renderHook, act } from '@testing-library/react'
import { useLocalStorage } from './useLocalStorage'

// Keys are namespaced and only those are removed, so other data on this origin survives.
const k = (name) => `prepbench-test:${name}`
function removeTestKeys() {
  for (const key of Object.keys(window.localStorage)) if (key.startsWith('prepbench-test:')) window.localStorage.removeItem(key)
}
beforeEach(removeTestKeys)
afterEach(removeTestKeys)

test('returns the initial value when nothing is stored', () => {
  const { result } = renderHook(() => useLocalStorage(k('lang'), 'en'))
  expect(result.current[0]).toBe('en')
})

test('reads an existing stored value on mount', () => {
  window.localStorage.setItem(k('prefs'), JSON.stringify({ compact: true }))
  const { result } = renderHook(() => useLocalStorage(k('prefs'), {}))
  expect(result.current[0]).toEqual({ compact: true })
})

test('setValue updates state and writes JSON to storage', () => {
  const { result } = renderHook(() => useLocalStorage(k('tags'), []))
  act(() => result.current[1](['a', 'b']))
  expect(result.current[0]).toEqual(['a', 'b'])
  expect(window.localStorage.getItem(k('tags'))).toBe('["a","b"]')
})

test('updater functions chain within one update', () => {
  const { result } = renderHook(() => useLocalStorage(k('n'), 0))
  act(() => {
    result.current[1]((n) => n + 1)
    result.current[1]((n) => n + 1)
  })
  expect(result.current[0]).toBe(2)
  expect(window.localStorage.getItem(k('n'))).toBe('2')
})

test('falls back to the initial value when the stored JSON is invalid', () => {
  window.localStorage.setItem(k('broken'), '{not json')
  const { result } = renderHook(() => useLocalStorage(k('broken'), 'safe'))
  expect(result.current[0]).toBe('safe')
})

test('keeps instances with the same key in sync', () => {
  const a = renderHook(() => useLocalStorage(k('theme'), 'light'))
  const b = renderHook(() => useLocalStorage(k('theme'), 'light'))
  const other = renderHook(() => useLocalStorage(k('font'), 'serif'))
  act(() => a.result.current[1]('dark'))
  expect(b.result.current[0]).toBe('dark')
  expect(other.result.current[0]).toBe('serif')
})

test('picks up storage events from other tabs, including removal', () => {
  const { result } = renderHook(() => useLocalStorage(k('city'), 'Pune'))
  act(() => {
    window.dispatchEvent(new window.StorageEvent('storage', { key: k('city'), newValue: '"Oslo"' }))
  })
  expect(result.current[0]).toBe('Oslo')
  act(() => {
    window.dispatchEvent(new window.StorageEvent('storage', { key: k('city'), newValue: null }))
  })
  expect(result.current[0]).toBe('Pune')
})

test('removes its storage listener on unmount', () => {
  const add = jest.spyOn(window, 'addEventListener')
  const remove = jest.spyOn(window, 'removeEventListener')
  try {
    const { unmount } = renderHook(() => useLocalStorage(k('x'), 1))
    const added = add.mock.calls.filter((c) => c[0] === 'storage')
    expect(added.length).toBeGreaterThan(0)
    unmount()
    for (const [, handler] of added) expect(remove.mock.calls.some((c) => c[0] === 'storage' && c[1] === handler)).toBe(true)
  } finally {
    add.mockRestore()
    remove.mockRestore()
  }
})
