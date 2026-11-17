import { useState, useRef, useCallback, useEffect } from 'react'

export function useCopyToClipboard(resetAfter = 2000) {
  const [state, setState] = useState({ copied: false, error: undefined })
  const timer = useRef(null)
  const resetRef = useRef(resetAfter)

  useEffect(() => {
    resetRef.current = resetAfter
  })

  useEffect(() => () => clearTimeout(timer.current), [])

  const copy = useCallback(async (text) => {
    clearTimeout(timer.current)
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard API not available')
      await navigator.clipboard.writeText(text)
      setState({ copied: true, error: undefined })
      timer.current = setTimeout(() => setState((s) => ({ ...s, copied: false })), resetRef.current)
      return true
    } catch (error) {
      setState({ copied: false, error })
      return false
    }
  }, [])

  return { copy, ...state }
}
