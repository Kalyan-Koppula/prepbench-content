import { useState, useEffect } from 'react'

export function useFetch(url) {
  const [state, setState] = useState({ data: undefined, error: undefined, loading: url != null })

  useEffect(() => {
    if (url == null) {
      setState({ data: undefined, error: undefined, loading: false })
      return
    }
    const controller = new AbortController()
    setState({ data: undefined, error: undefined, loading: true })

    async function load() {
      try {
        const res = await fetch(url, { signal: controller.signal })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        if (!controller.signal.aborted) setState({ data, error: undefined, loading: false })
      } catch (error) {
        if (controller.signal.aborted || error?.name === 'AbortError') return
        setState({ data: undefined, error, loading: false })
      }
    }
    load()

    return () => controller.abort()
  }, [url])

  return state
}
