import { useEffect, useRef } from 'react'

const MODIFIERS = ['ctrl', 'alt', 'shift', 'meta']

function parse(combo) {
  const text = combo.trim().toLowerCase()
  // The key itself may be "+", as in "+" or "ctrl++".
  const cut = text === '+' ? -1 : text.endsWith('++') ? text.length - 2 : text.lastIndexOf('+')
  const key = cut === -1 ? text : text.slice(cut + 1)
  const mods = cut === -1 ? [] : text.slice(0, cut).split('+').map((m) => m.trim())
  return { key, ...Object.fromEntries(MODIFIERS.map((m) => [m, mods.includes(m)])) }
}

function matches(spec, e) {
  return (
    e.key.toLowerCase() === spec.key &&
    e.ctrlKey === spec.ctrl &&
    e.altKey === spec.alt &&
    e.shiftKey === spec.shift &&
    e.metaKey === spec.meta
  )
}

function isTyping(target) {
  if (!target || !target.tagName) return false
  const tag = target.tagName.toLowerCase()
  return tag === 'input' || tag === 'textarea' || tag === 'select' || target.isContentEditable === true
}

export function useKeyPress(combo, handler, { preventDefault = false, enableInInputs = false } = {}) {
  const saved = useRef(handler)

  useEffect(() => {
    saved.current = handler
  })

  // Key the subscription on a string so an inline array doesn't resubscribe every render.
  const comboKey = (Array.isArray(combo) ? combo : [combo]).join('\n')

  useEffect(() => {
    const specs = comboKey.split('\n').map(parse)
    function onKeyDown(e) {
      if (!enableInInputs && isTyping(e.target)) return
      if (!specs.some((spec) => matches(spec, e))) return
      if (preventDefault) e.preventDefault()
      saved.current(e)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [comboKey, preventDefault, enableInInputs])
}
