const click = (el) => el.dispatchEvent(new window.Event('click', { bubbles: true }))

beforeEach(() => {
  document.body.innerHTML = `
    <div class="row" id="outside">
      <ul id="list">
        <li class="row" id="r1"><span id="s1">One</span> <button id="b1">x</button></li>
        <li class="row" id="r2"><span id="s2">Two</span></li>
        <li id="plain">Not a row</li>
      </ul>
    </div>`
})

test('calls the handler when a matching element is clicked', () => {
  const handler = fn()
  delegate(document.getElementById('list'), '.row', 'click', handler)
  click(document.getElementById('r2'))
  expect(handler).toHaveBeenCalledTimes(1)
})

test('finds the matching ancestor of the real target', () => {
  const seen = []
  const handler = fn(function (event, matched) {
    seen.push({ self: this.id, matched: matched.id, target: event.target.id, type: event.type })
  })
  delegate(document.getElementById('list'), '.row', 'click', handler)
  click(document.getElementById('s1'))
  expect(seen).toEqual([{ self: 'r1', matched: 'r1', target: 's1', type: 'click' }])
})

test('ignores events that do not come from a match', () => {
  const handler = fn()
  delegate(document.getElementById('list'), '.row', 'click', handler)
  click(document.getElementById('plain'))
  click(document.getElementById('list'))
  expect(handler).not.toHaveBeenCalled()
})

test('ignores matching ancestors outside the root', () => {
  const handler = fn()
  delegate(document.getElementById('list'), '.row', 'click', handler)
  click(document.getElementById('plain'))
  click(document.getElementById('outside'))
  expect(handler).not.toHaveBeenCalled()
})

test('never treats the root itself as a match', () => {
  const handler = fn()
  const list = document.getElementById('list')
  list.classList.add('row')
  delegate(list, '.row', 'click', handler)
  click(document.getElementById('plain'))
  expect(handler).not.toHaveBeenCalled()
  click(document.getElementById('b1'))
  expect(handler.mock.calls[0][1].id).toBe('r1')
})

test('calls once, for the nearest match, when matches are nested', () => {
  const handler = fn()
  delegate(document.getElementById('list'), 'li, span', 'click', handler)
  click(document.getElementById('s2'))
  expect(handler).toHaveBeenCalledTimes(1)
  expect(handler.mock.calls[0][1].id).toBe('s2')
})

test('handles elements added after delegating', () => {
  const handler = fn()
  const list = document.getElementById('list')
  delegate(list, '.row', 'click', handler)
  const li = document.createElement('li')
  li.className = 'row'
  li.innerHTML = '<em>new</em>'
  list.appendChild(li)
  click(li.firstChild)
  expect(handler).toHaveBeenCalledTimes(1)
  expect(handler.mock.calls[0][1]).toBe(li)
})

test('only listens for the given event type', () => {
  const handler = fn()
  delegate(document.getElementById('list'), '.row', 'keydown', handler)
  click(document.getElementById('r1'))
  expect(handler).not.toHaveBeenCalled()
  document.getElementById('b1').dispatchEvent(new window.Event('keydown', { bubbles: true }))
  expect(handler).toHaveBeenCalledTimes(1)
})

test('unsubscribe stops only that delegation', () => {
  const list = document.getElementById('list')
  const a = fn()
  const b = fn()
  const stopA = delegate(list, '.row', 'click', a)
  delegate(list, 'button', 'click', b)
  stopA()
  click(document.getElementById('b1'))
  expect(a).not.toHaveBeenCalled()
  expect(b).toHaveBeenCalledTimes(1)
})

test('registers the same handler twice as two subscriptions', () => {
  const handler = fn()
  const list = document.getElementById('list')
  const stop1 = delegate(list, '.row', 'click', handler)
  delegate(list, '.row', 'click', handler)
  click(document.getElementById('r1'))
  expect(handler).toHaveBeenCalledTimes(2)
  stop1()
  click(document.getElementById('r1'))
  expect(handler).toHaveBeenCalledTimes(3)
})
