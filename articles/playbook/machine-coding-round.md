---
title: The Machine Coding Round
order: 2
summary: Building a working UI in 60–90 minutes — scope first, design state, build in a safe order, and finish with a11y and edge cases.
---

Machine coding rounds ask you to build a small but real UI — an autocomplete, a kanban board, a star rating, a file explorer, an infinite feed — in 60–90 minutes. They test whether you can ship something working, structured and robust under time pressure. A finished, clean core beats an ambitious, half-working feature list.

## Typical prompts

| Prompt | What it really tests |
|---|---|
| Autocomplete / typeahead | Debouncing, race conditions, keyboard navigation, ARIA combobox |
| Todo / kanban board | State shape, immutable updates, drag and drop |
| Tabs, accordion, modal | Component API, focus management, keyboard support |
| Star rating, progress bar | Controlled components, hover vs committed state |
| Nested comments / file tree | Recursive components, normalised data |
| Infinite scroll feed | `IntersectionObserver`, pagination, loading/error states |
| Data table | Sorting, filtering, pagination, derived state |
| Tic-tac-toe, snake, memory game | Game state as data, win detection, reset |

## Scoping (first 5–10 minutes)

Do not touch the keyboard until you have agreed the scope. Ask:

- What are the must-have features versus nice-to-haves?
- Is there an API, or should I mock data? What's the shape?
- Which browsers and devices? Is mobile layout expected?
- Are libraries allowed (state, styling, drag and drop)? Usually not.
- How will it be evaluated: running demo, code walkthrough, or both?

Write the agreed scope as a short checklist at the top of the file. It doubles as your progress tracker and shows structure.

```text
Must: search input, debounced fetch, results list, keyboard nav, empty/error states
Nice: highlight match, cache results, recent searches
Out: styling polish, tests
```

## Design before code

Spend 5 minutes on component boundaries and state. Interviewers explicitly look for this.

1. **Sketch the tree.** `App → SearchBox → ResultsList → ResultItem`.
2. **Find the minimal state.** Store only what can't be derived. `filteredItems` is derived from `items` and `query`; don't store it.
3. **Decide where state lives.** Lift it to the lowest common parent of everything that reads it.
4. **Define props/events.** `onSelect(item)`, `value`, `onChange`. Prefer controlled components.
5. **Normalise nested data.** Store `{ byId, rootIds }` for trees or boards so updates are O(1) and immutable.

```ts
type Board = {
  columns: Record<string, { id: string; title: string; cardIds: string[] }>
  cards: Record<string, { id: string; text: string }>
  columnOrder: string[]
}
```

## Order of work

Build in an order where you always have something that runs.

1. **Static markup** with hard-coded data. Get it rendering.
2. **State and core interaction** — the one feature that defines the task.
3. **Data fetching** with loading, error and empty states.
4. **Secondary features** from the must-have list.
5. **Keyboard and a11y pass.**
6. **Edge cases** — empty input, long text, rapid clicks, slow network.
7. **Refactor and polish** only if time remains.

Commit mentally at each step: if time ran out now, would it demo?

## Accessibility and edge-case checklist

- Use semantic elements: `button` for actions, `a` for navigation, `ul/li` for lists, `label` linked to inputs.
- Every interactive element is reachable with Tab and operable with Enter/Space.
- Visible focus styles; don't remove outlines without a replacement.
- Modals trap focus, close on Escape, and restore focus to the trigger. The native `<dialog>` with `showModal()` gives most of this.
- Live regions (`aria-live="polite"`) for async results counts or errors.
- ARIA patterns where needed: `role="combobox"`, `aria-expanded`, `aria-activedescendant`, `role="tablist"`/`tab`/`tabpanel`.
- Empty state, loading state, error state with retry.
- Debounce input; ignore stale responses (compare a request id or use `AbortController`).
- Guard double submits by disabling the button while pending.
- Long text truncates or wraps without breaking layout.
- Unique, stable `key`s — never array index for reorderable lists.

```ts
// Ignore stale responses in a typeahead
let controller: AbortController | undefined
async function search(q: string) {
  controller?.abort()
  controller = new AbortController()
  try {
    const res = await fetch(`/api?q=${encodeURIComponent(q)}`, { signal: controller.signal })
    render(await res.json())
  } catch (e) {
    if ((e as Error).name !== 'AbortError') showError()
  }
}
```

## What evaluators score

| Area | What they look for |
|---|---|
| Functionality | Must-haves work end to end, no console errors |
| Code structure | Small components, clear names, no giant functions |
| State management | Minimal state, derived values computed, immutable updates |
| Edge cases | Empty/loading/error handled, races avoided |
| Accessibility | Semantic HTML, keyboard support, focus management |
| Communication | Explained trade-offs, asked good questions, stayed on scope |
| Extensibility | Easy to add a feature they ask for at the end |

Expect a follow-up like "now add undo", "make it work with 10,000 items", or "persist across reloads". Good structure makes these cheap; mention virtualisation, a command/history stack, or `localStorage` respectively.

## React vs vanilla

| | React | Vanilla JS |
|---|---|---|
| When asked | Most product companies | Some platform-focused or framework-agnostic teams |
| Strength | Declarative UI, state drives render | Shows DOM, events and browser API knowledge |
| Watch for | Unnecessary effects, stale closures, missing keys | Manual re-render bugs, listener leaks |
| State pattern | `useState` / `useReducer`, lift state up | Single state object + `render()` function |
| Events | Props callbacks | Event delegation on a container |

For vanilla, mimic a framework: one state object, one `render(state)` that rebuilds or patches the DOM, and a delegated listener that dispatches actions.

```js
const state = { todos: [], filter: 'all' }
const list = document.querySelector('#list')

list.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-action]')
  if (!btn) return
  const id = btn.closest('li').dataset.id
  if (btn.dataset.action === 'delete') state.todos = state.todos.filter((t) => t.id !== id)
  render()
})
```

In React, prefer `useReducer` once there are more than two or three related pieces of state; it makes actions explicit and is easy to extend with undo.

## A worked round: "Build a star rating component"

**Scoping (5 minutes).** "Five stars, click to set, hover to preview, keyboard accessible, optional read-only mode, half stars out of scope. Controlled or uncontrolled? Both would be nice; I'll support `value` plus `onChange` with a `defaultValue` fallback."

**Design (5 minutes).** The candidate chooses native radio inputs as the foundation, because a rating is "choose one of five": keyboard arrows, focus, form submission and screen-reader semantics come for free.

**Build (25 minutes).**

```tsx
function StarRating({ name, label, value, defaultValue = 0, onChange, max = 5, readOnly = false }: {
  name: string
  label: string
  value?: number
  defaultValue?: number
  onChange?: (value: number) => void
  max?: number
  readOnly?: boolean
}) {
  const [internal, setInternal] = useState(defaultValue)
  const [hovered, setHovered] = useState<number | null>(null)
  const current = value ?? internal // controlled if `value` is provided
  const shown = hovered ?? current

  function select(next: number) {
    if (readOnly) return
    if (value === undefined) setInternal(next)
    onChange?.(next)
  }

  return (
    <fieldset className="stars" onMouseLeave={() => setHovered(null)} disabled={readOnly}>
      <legend>{label}</legend>
      {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
        <label key={n} onMouseEnter={() => !readOnly && setHovered(n)}>
          <input
            type="radio"
            name={name}
            value={n}
            checked={current === n}
            onChange={() => select(n)}
            className="visually-hidden"
          />
          <span aria-hidden="true" className={n <= shown ? 'star filled' : 'star'}>★</span>
          <span className="visually-hidden">{n} {n === 1 ? 'star' : 'stars'}</span>
        </label>
      ))}
    </fieldset>
  )
}
```

**Polish (5 minutes).** Visible focus ring on the focused star (`:focus-visible` on the hidden input styles its sibling), `prefers-reduced-motion` for the hover animation, and a quick check with the keyboard: Tab into the group, arrows change the rating, the screen reader says "3 stars, radio button, 3 of 5".

**Wrap-up.** "Next steps would be half-star support (ten radios with half-width labels), a clear button, and tests for controlled and uncontrolled modes."

What scored well: scoping before coding, a semantic foundation that made accessibility cheap, a clean controlled/uncontrolled API, and a working, demonstrable component with time left to discuss extensions.

## Common interview questions

**Why not store filtered results in state?**
They're derivable from the source list and the query. Storing both risks them going out of sync; compute during render and memoise only if profiling shows a cost.

**How would you handle 10,000 rows?**
Virtualise: render only visible rows plus a buffer, using a fixed row height or measured heights. Also debounce filters and move heavy work off the input path.

**How do you prevent race conditions in search?**
Abort the previous request with `AbortController`, or tag each request with an id and ignore responses that aren't the latest.

**Why not use the index as a key?**
Reordering or inserting shifts indices, so React reuses the wrong component instance and its local state or input value follows the wrong item.

**How would you test this?**
React Testing Library for behaviour (type, see results, press arrow keys), unit tests for reducers and pure helpers, and a mocked fetch.

## Pitfalls

- Spending 30 minutes on CSS before the core interaction works.
- One 300-line component holding all state and markup.
- `useEffect` to sync derived state, causing extra renders and bugs.
- `div` with `onClick` instead of `button`.
- Silent scope creep: adding features nobody asked for while must-haves are broken.
- Not running the app until the end.

## Key takeaways

- Spend the first 5–10 minutes scoping: features, states, edge cases, controlled or uncontrolled.
- Choose semantic HTML foundations; they bring keyboard and screen-reader support for free.
- Build the core working path first, then polish, then extend.
- Keep state minimal and derived values computed.
- Leave time to demo, test with the keyboard and discuss next steps.
