import { render, screen, fireEvent } from '@testing-library/react'
import { useHover } from './useHover'

function Card({ show = true, which = 'a' }) {
  const [ref, hovered] = useHover()
  return (
    <div>
      <output>{hovered ? 'hovered' : 'idle'}</output>
      {show && which === 'a' && <p ref={ref}>card a</p>}
      {show && which === 'b' && <p ref={ref}>card b</p>}
    </div>
  )
}

const state = () => screen.getByRole('status').textContent

test('is true while the pointer is over the element', () => {
  render(<Card />)
  expect(state()).toBe('idle')
  fireEvent.mouseEnter(screen.getByText('card a'))
  expect(state()).toBe('hovered')
  fireEvent.mouseLeave(screen.getByText('card a'))
  expect(state()).toBe('idle')
})

test('works when the element appears after the first render', () => {
  const { rerender } = render(<Card show={false} />)
  rerender(<Card show />)
  fireEvent.mouseEnter(screen.getByText('card a'))
  expect(state()).toBe('hovered')
})

test('follows the ref to a new element', () => {
  const { rerender } = render(<Card which="a" />)
  const oldCard = screen.getByText('card a')
  rerender(<Card which="b" />)
  fireEvent.mouseEnter(oldCard)
  expect(state()).toBe('idle')
  fireEvent.mouseEnter(screen.getByText('card b'))
  expect(state()).toBe('hovered')
})

test('resets to false when the hovered element is removed', () => {
  const { rerender } = render(<Card />)
  fireEvent.mouseEnter(screen.getByText('card a'))
  rerender(<Card show={false} />)
  expect(state()).toBe('idle')
})

test('removes its listeners from old elements and on unmount', () => {
  const add = jest.spyOn(window.HTMLElement.prototype, 'addEventListener')
  const remove = jest.spyOn(window.HTMLElement.prototype, 'removeEventListener')
  try {
    const { rerender, unmount } = render(<Card which="a" />)
    rerender(<Card which="b" />)
    unmount()
    const added = add.mock.calls.filter((c) => c[0] === 'mouseenter' || c[0] === 'mouseleave')
    expect(added.length).toBeGreaterThanOrEqual(4)
    for (const [type, fn] of added) expect(remove.mock.calls.some((c) => c[0] === type && c[1] === fn)).toBe(true)
  } finally {
    add.mockRestore()
    remove.mockRestore()
  }
})
