import { renderHook, act, waitFor, cleanup } from '@testing-library/react'
import { useFetch } from './useFetch'

// A fake fetch that you resolve by hand. Like the real one, it rejects with an
// AbortError when its signal aborts, and so does json() on an aborted request.
let requests
const originalFetch = globalThis.fetch
const abortError = () => new DOMException('The operation was aborted.', 'AbortError')

beforeEach(() => {
  requests = []
  globalThis.fetch = jest.fn(
    (url, init = {}) =>
      new Promise((resolve, reject) => {
        const signal = init.signal
        const req = {
          url,
          signal,
          respond: (body, status = 200) =>
            resolve({
              ok: status >= 200 && status < 300,
              status,
              json: async () => {
                if (signal?.aborted) throw abortError()
                return body
              },
            }),
          fail: (err) => reject(err),
        }
        signal?.addEventListener('abort', () => reject(abortError()))
        requests.push(req)
      }),
  )
})
afterEach(() => {
  cleanup()
  globalThis.fetch = originalFetch
})

// Only promises are involved, so this settles within a few milliseconds.
const until = (check) => waitFor(check, { timeout: 250, interval: 5 })

test('loads JSON and reports loading while waiting', async () => {
  const { result } = renderHook(() => useFetch('/api/users/1'))
  expect(result.current.loading).toBe(true)
  expect(requests[0].url).toBe('/api/users/1')
  requests[0].respond({ name: 'Ada' })
  await until(() => expect(result.current.data).toEqual({ name: 'Ada' }))
  expect(result.current.loading).toBe(false)
  expect(result.current.error).toBeUndefined()
})

test('passes an AbortSignal to fetch', () => {
  renderHook(() => useFetch('/api/a'))
  expect(globalThis.fetch).toHaveBeenCalledTimes(1)
  const signal = requests[0].signal
  expect(typeof signal?.aborted).toBe('boolean')
  expect(typeof signal?.addEventListener).toBe('function')
})

test('aborts the previous request when the url changes and clears old data', async () => {
  const { result, rerender } = renderHook(({ url }) => useFetch(url), { initialProps: { url: '/api/users/1' } })
  requests[0].respond({ id: 1 })
  await until(() => expect(result.current.data).toEqual({ id: 1 }))
  rerender({ url: '/api/users/2' })
  expect(result.current.data).toBeUndefined()
  expect(result.current.loading).toBe(true)
  rerender({ url: '/api/users/3' })
  expect(requests[1].signal.aborted).toBe(true)
  requests[2].respond({ id: 3 })
  await until(() => expect(result.current.data).toEqual({ id: 3 }))
})

test('never shows a stale response, even one that arrives late', async () => {
  const { result, rerender } = renderHook(({ url }) => useFetch(url), { initialProps: { url: '/slow' } })
  rerender({ url: '/fast' })
  requests[1].respond('fast')
  await until(() => expect(result.current.data).toBe('fast'))
  requests[0].respond('slow')
  await act(() => new Promise((r) => setTimeout(r, 20)))
  expect(result.current.data).toBe('fast')
  expect(result.current.error).toBeUndefined()
})

test('aborts the in-flight request on unmount', () => {
  const { unmount } = renderHook(() => useFetch('/api/feed'))
  unmount()
  expect(requests[0].signal.aborted).toBe(true)
})

test('turns a non-2xx status into an error', async () => {
  const { result } = renderHook(() => useFetch('/missing'))
  requests[0].respond({ message: 'nope' }, 404)
  await until(() => expect(result.current.error).toBeInstanceOf(Error))
  expect(result.current.error.message).toMatch(/404/)
  expect(result.current.data).toBeUndefined()
  expect(result.current.loading).toBe(false)
})

test('reports network errors but not aborts', async () => {
  const { result, rerender } = renderHook(({ url }) => useFetch(url), { initialProps: { url: '/a' } })
  rerender({ url: '/b' })
  await act(() => new Promise((r) => setTimeout(r, 10)))
  expect(result.current.error).toBeUndefined()
  expect(result.current.loading).toBe(true)
  requests[1].fail(new TypeError('Failed to fetch'))
  await until(() => expect(result.current.error).toBeInstanceOf(TypeError))
  expect(result.current.loading).toBe(false)
})

test('does nothing for a null url', () => {
  const { result } = renderHook(() => useFetch(null))
  expect(globalThis.fetch).not.toHaveBeenCalled()
  expect(result.current).toEqual({ data: undefined, error: undefined, loading: false })
})
