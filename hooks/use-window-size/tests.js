import { renderHook, act, cleanup } from '@testing-library/react'
import { useWindowSize } from './useWindowSize'

// Some in-browser runners give the test a DOM `window` that is not `globalThis`,
// so the size goes on both: the hook may read `window.innerWidth` or just `innerWidth`.
const scopes = [...new Set([window, globalThis])]

function setSize(width, height) {
  for (const scope of scopes) {
    Object.defineProperty(scope, 'innerWidth', { configurable: true, writable: true, value: width })
    Object.defineProperty(scope, 'innerHeight', { configurable: true, writable: true, value: height })
  }
}
function resizeTo(width, height) {
  setSize(width, height)
  window.dispatchEvent(new window.Event('resize'))
}

let savedSizes
beforeEach(() => {
  savedSizes = scopes.map((scope) => [scope, ['innerWidth', 'innerHeight'].map((k) => [k, Object.getOwnPropertyDescriptor(scope, k)])])
  setSize(1024, 768)
})
afterEach(() => {
  cleanup()
  for (const [scope, entries] of savedSizes)
    for (const [k, descriptor] of entries) {
      if (descriptor) Object.defineProperty(scope, k, descriptor)
      else delete scope[k]
    }
})

test('returns the current size on the first render', () => {
  const seen = []
  renderHook(() => {
    const size = useWindowSize()
    seen.push(size)
    return size
  })
  expect(seen[0]).toEqual({ width: 1024, height: 768 })
})

test('updates when the window is resized', () => {
  const { result } = renderHook(() => useWindowSize())
  act(() => resizeTo(390, 844))
  expect(result.current).toEqual({ width: 390, height: 844 })
  act(() => resizeTo(1280, 720))
  expect(result.current).toEqual({ width: 1280, height: 720 })
})

test('returns the same object on unrelated re-renders', () => {
  const { result, rerender } = renderHook(() => useWindowSize())
  const first = result.current
  rerender()
  rerender()
  expect(result.current).toBe(first)
})

test('does not re-render when a resize leaves the size unchanged', () => {
  let renders = 0
  renderHook(() => {
    renders++
    return useWindowSize()
  })
  const before = renders
  act(() => resizeTo(1024, 768))
  act(() => resizeTo(1024, 768))
  expect(renders).toBe(before)
})

test('stops listening after unmount', () => {
  const add = jest.spyOn(window, 'addEventListener')
  const remove = jest.spyOn(window, 'removeEventListener')
  try {
    const { unmount } = renderHook(() => useWindowSize())
    const added = add.mock.calls.filter((c) => c[0] === 'resize')
    expect(added.length).toBeGreaterThan(0)
    unmount()
    for (const [, fn] of added) expect(remove.mock.calls.some((c) => c[0] === 'resize' && c[1] === fn)).toBe(true)
  } finally {
    add.mockRestore()
    remove.mockRestore()
  }
})
