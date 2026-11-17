import { useState, useRef, useCallback } from 'react'

export function useHover() {
  const [hovered, setHovered] = useState(false)
  const detach = useRef(null)

  // A callback ref runs with the node when it mounts and with null when it unmounts,
  // so it follows conditional rendering and element swaps.
  const ref = useCallback((node) => {
    if (detach.current) {
      detach.current()
      detach.current = null
    }
    setHovered(false)
    if (!node) return
    const enter = () => setHovered(true)
    const leave = () => setHovered(false)
    node.addEventListener('mouseenter', enter)
    node.addEventListener('mouseleave', leave)
    detach.current = () => {
      node.removeEventListener('mouseenter', enter)
      node.removeEventListener('mouseleave', leave)
    }
  }, [])

  return [ref, hovered]
}
