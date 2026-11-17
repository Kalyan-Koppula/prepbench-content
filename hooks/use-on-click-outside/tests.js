import { useRef } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { useOnClickOutside } from './useOnClickOutside'

function Popover({ onOutside, showPanel = true, withTrigger = false }) {
  const panel = useRef(null)
  const trigger = useRef(null)
  useOnClickOutside(withTrigger ? [trigger, panel] : panel, onOutside)
  return (
    <div>
      <button ref={trigger}>trigger</button>
      {showPanel && (
        <section ref={panel}>
          <span>inside</span>
        </section>
      )}
      <p>elsewhere</p>
    </div>
  )
}

test('calls the handler on a mousedown outside', () => {
  const onOutside = jest.fn()
  render(<Popover onOutside={onOutside} />)
  fireEvent.mouseDown(screen.getByText('elsewhere'))
  expect(onOutside).toHaveBeenCalledTimes(1)
  expect(onOutside.mock.calls[0][0].type).toBe('mousedown')
})

test('ignores presses inside the element and its children', () => {
  const onOutside = jest.fn()
  render(<Popover onOutside={onOutside} />)
  fireEvent.mouseDown(screen.getByText('inside'))
  fireEvent.mouseDown(screen.getByText('inside').parentElement)
  expect(onOutside).not.toHaveBeenCalled()
})

test('treats touchstart outside as an outside press', () => {
  const onOutside = jest.fn()
  render(<Popover onOutside={onOutside} />)
  fireEvent.touchStart(document.body)
  expect(onOutside).toHaveBeenCalledTimes(1)
})

test('accepts an array of refs', () => {
  const onOutside = jest.fn()
  render(<Popover onOutside={onOutside} withTrigger />)
  fireEvent.mouseDown(screen.getByText('trigger'))
  fireEvent.mouseDown(screen.getByText('inside'))
  expect(onOutside).not.toHaveBeenCalled()
  fireEvent.mouseDown(screen.getByText('elsewhere'))
  expect(onOutside).toHaveBeenCalledTimes(1)
})

test('does nothing while the element is not rendered', () => {
  const onOutside = jest.fn()
  render(<Popover onOutside={onOutside} showPanel={false} />)
  fireEvent.mouseDown(screen.getByText('elsewhere'))
  expect(onOutside).not.toHaveBeenCalled()
})

test('calls the latest handler', () => {
  const first = jest.fn()
  const second = jest.fn()
  const { rerender } = render(<Popover onOutside={first} />)
  rerender(<Popover onOutside={second} />)
  fireEvent.mouseDown(document.body)
  expect(first).not.toHaveBeenCalled()
  expect(second).toHaveBeenCalledTimes(1)
})

test('stops listening after unmount', () => {
  const onOutside = jest.fn()
  const { unmount } = render(<Popover onOutside={onOutside} />)
  unmount()
  fireEvent.mouseDown(document.body)
  fireEvent.touchStart(document.body)
  expect(onOutside).not.toHaveBeenCalled()
})
