import { useEffect, useRef } from 'react'

export function useOnClickOutside(refs, handler) {
  const saved = useRef(handler)
  const refsRef = useRef(refs)

  useEffect(() => {
    saved.current = handler
    refsRef.current = refs
  })

  useEffect(() => {
    function onPress(event) {
      const list = Array.isArray(refsRef.current) ? refsRef.current : [refsRef.current]
      const elements = list.map((r) => r && r.current).filter(Boolean)
      if (elements.length === 0) return
      if (elements.some((el) => el.contains(event.target))) return
      saved.current(event)
    }
    document.addEventListener('mousedown', onPress)
    document.addEventListener('touchstart', onPress)
    return () => {
      document.removeEventListener('mousedown', onPress)
      document.removeEventListener('touchstart', onPress)
    }
  }, [])
}
