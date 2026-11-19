---
title: Accessibility Essentials
order: 1
summary: Semantic HTML first, accessible names, the rules of ARIA, keyboard and focus management, live regions, contrast, testing, and the keyboard contracts for common widgets.
---

Accessibility shows up in frontend interviews as standalone questions ("make this dropdown accessible") and inside every component or system design round. Interviewers look for semantic HTML by default, correct ARIA only when needed, complete keyboard support, and knowing how to verify it.

## Why it matters

- Users: screen reader, keyboard-only, switch, voice control, magnification, low vision, cognitive and motor differences, temporary impairments.
- Legal: WCAG 2.2 level AA is the usual target (referenced by the ADA in the US, the European Accessibility Act from June 2025, EN 301 549).
- WCAG principles: **Perceivable, Operable, Understandable, Robust** (POUR).

## Semantic HTML first

Native elements come with role, name computation, keyboard behaviour and states for free.

| Need | Use | Not |
|---|---|---|
| Action | `<button type="button">` | `<div onclick>` |
| Navigation | `<a href>` | `<span onclick="location=...">` |
| Page regions | `<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>` | Generic `div`s |
| Headings | `<h1>`–`<h6>` in logical order | Bold text |
| Form field label | `<label for>` | Placeholder as the only label |
| Grouped controls | `<fieldset>` + `<legend>` | Visual box only |
| Modal | `<dialog>` + `showModal()` | Hand-built overlay without focus handling |
| Disclosure | `<details>` / `<summary>` | Custom toggle without `aria-expanded` |
| Data | `<table>` with `<th scope>` | CSS grid of divs |

A `div` button needs `role="button"`, `tabindex="0"`, Enter and Space handlers, disabled handling and focus styles to approach what `<button>` gives you.

## Accessible names

Every interactive element needs an **accessible name** (what a screen reader announces). Computation order, roughly:

1. `aria-labelledby` (references other elements' text)
2. `aria-label`
3. Native labelling: `<label>`, `alt`, `<caption>`, `<legend>`, `title` as last resort
4. Element content (for buttons, links, headings)

```html
<label for="email">Email</label>
<input id="email" type="email" aria-describedby="email-hint" autocomplete="email">
<p id="email-hint">We'll never share it.</p>

<button type="button" aria-label="Close dialog">
  <svg aria-hidden="true" focusable="false"><!-- x icon --></svg>
</button>

<img src="chart.png" alt="Revenue grew 40% from Q1 to Q4">
<img src="divider.png" alt="">  <!-- decorative: empty alt, skipped -->
```

- `aria-describedby` adds a description (hints, errors) announced after the name.
- Visible label text should be contained in the accessible name (voice control users say what they see).
- Placeholder disappears on input and is low contrast; it is not a label.

## The rules of ARIA

1. **First rule: don't use ARIA if a native element or attribute does the job.** "No ARIA is better than bad ARIA."
2. Don't change native semantics unless you must (`<h2 role="tab">` is wrong; wrap instead).
3. All interactive ARIA controls must be keyboard operable.
4. Don't use `role="presentation"` or `aria-hidden="true"` on focusable elements.
5. All interactive elements must have an accessible name.

ARIA only changes what assistive technology is told. It adds **no behaviour**: `role="button"` doesn't make Enter work.

| Category | Examples |
|---|---|
| Roles | `dialog`, `tablist`/`tab`/`tabpanel`, `menu`/`menuitem`, `combobox`, `listbox`/`option`, `alert`, `status` |
| States | `aria-expanded`, `aria-selected`, `aria-checked`, `aria-pressed`, `aria-disabled`, `aria-invalid`, `aria-current` |
| Properties | `aria-label(ledby)`, `aria-describedby`, `aria-controls`, `aria-haspopup`, `aria-modal`, `aria-activedescendant`, `aria-live` |

`aria-hidden="true"` removes content from the accessibility tree (still visible). `hidden` / `display: none` removes it for everyone. The `inert` attribute makes a subtree non-focusable and hidden from AT, ideal for content behind a modal.

## Keyboard navigation

- Everything operable by mouse must be operable by keyboard (WCAG 2.1.1).
- **Tab / Shift+Tab** moves between widgets; **arrow keys** move within a composite widget (tabs, menus, listboxes, grids, radio groups).
- Tab order follows DOM order. Fix order in the DOM, not with positive `tabindex`.
- Visible focus indicator always (WCAG 2.4.7); use `:focus-visible` to show it for keyboard without flashing on mouse click. WCAG 2.2 adds that focus must not be fully hidden by sticky headers or overlays.
- Provide a **skip link** to `main` content.

| `tabindex` | Effect |
|---|---|
| none on native control | Focusable in DOM order |
| `0` | Adds a non-native element to the tab order |
| `-1` | Focusable by script (`el.focus()`), not by Tab |
| positive | Jumps ahead of natural order; avoid |

## Focus management

Move focus deliberately when the UI changes context:

- **Open dialog**: focus the first meaningful element (or the dialog itself); trap Tab inside; Escape closes; **return focus** to the trigger on close.
- **Route change in a SPA**: move focus to the new page's `<h1>` (with `tabindex="-1"`) or a wrapper, and update `document.title`.
- **Delete an item**: move focus to the next item or a sensible container, never leave it on `<body>`.
- **Inline errors on submit**: focus the first invalid field or an error summary.

```ts
const dialog = document.querySelector('dialog')!
const trigger = document.activeElement as HTMLElement
dialog.showModal()                // native: inert background, Escape closes, top layer
dialog.addEventListener('close', () => trigger.focus(), { once: true })
```

Native `<dialog>` with `showModal()` handles the background inertness and Escape; you still handle initial focus choice (`autofocus` inside) and returning focus in older browsers.

## Roving tabindex

For composite widgets, the group is a **single tab stop**. Only the active item has `tabindex="0"`; the rest have `-1`; arrow keys move both focus and the `0`.

```ts
function onKeyDown(e: KeyboardEvent, items: HTMLElement[], index: number) {
  const last = items.length - 1
  const next =
    e.key === 'ArrowRight' ? (index === last ? 0 : index + 1) :
    e.key === 'ArrowLeft' ? (index === 0 ? last : index - 1) :
    e.key === 'Home' ? 0 :
    e.key === 'End' ? last : -1
  if (next === -1) return
  e.preventDefault()
  items[index].tabIndex = -1
  items[next].tabIndex = 0
  items[next].focus()
}
```

Alternative: **`aria-activedescendant`**. Focus stays on the container or input; it points at the id of the "active" child. Used by comboboxes because DOM focus must stay in the text input.

## Keyboard patterns for common widgets

These follow the WAI-ARIA Authoring Practices Guide (APG).

### Tabs

Roles: `tablist` > `tab` (with `aria-selected`, `aria-controls`) and `tabpanel` (with `aria-labelledby`).

| Key | Action |
|---|---|
| Tab | Into the tablist lands on the active tab; next Tab moves into the panel |
| Left / Right Arrow | Previous / next tab (wraps) |
| Home / End | First / last tab |
| Enter / Space | Activate focused tab (when activation is manual) |

Automatic activation (select on focus) is fine when panels render instantly; use manual activation if switching is slow.

### Menu button and menu

Roles: `button` with `aria-haspopup="menu"` and `aria-expanded`; `menu` > `menuitem` / `menuitemcheckbox` / `menuitemradio`. Use for application-style action menus, not site navigation (use a list of links for that).

| Key | Action |
|---|---|
| Enter / Space / Down Arrow on button | Open menu, focus first item |
| Up Arrow on button | Open menu, focus last item |
| Down / Up Arrow | Next / previous item (wraps) |
| Home / End | First / last item |
| Enter / Space | Activate item and close |
| Escape | Close and return focus to the button |
| Typing a character | Move to next item starting with it |
| Tab | Close the menu and move focus on |

### Dialog (modal)

Roles: `dialog` (or `alertdialog`), `aria-modal="true"`, labelled by its heading.

| Key | Action |
|---|---|
| Tab / Shift+Tab | Cycle through focusable elements inside the dialog only |
| Escape | Close the dialog |
| On open | Focus moves into the dialog |
| On close | Focus returns to the element that opened it |

### Combobox (editable with listbox popup)

Roles: `input` with `role="combobox"`, `aria-expanded`, `aria-controls` (listbox id), `aria-autocomplete="list"`, `aria-activedescendant`; popup `listbox` > `option` with `aria-selected`.

| Key | Action |
|---|---|
| Typing | Filters options, opens popup |
| Down Arrow | Open popup / move to next option |
| Up Arrow | Move to previous option |
| Enter | Accept the active option, close popup |
| Escape | Close popup; second Escape may clear input |
| Alt + Down Arrow | Open popup without moving the active option |
| Home / End | Move the text cursor in the input |

DOM focus stays in the input; the visual "active" option is conveyed by `aria-activedescendant`.

## Live regions

Announce dynamic changes that don't move focus: toasts, "3 results", form save status, chat messages.

```html
<div role="status" aria-live="polite" class="sr-only" id="results-count"></div>
<div role="alert">Payment failed. Check your card details.</div>
```

| | Interrupts | Use for |
|---|---|---|
| `aria-live="polite"` / `role="status"` | No, waits for idle | Results counts, saved, loading complete |
| `aria-live="assertive"` / `role="alert"` | Yes | Errors and urgent warnings only |

The region must **exist in the DOM before** content changes; inserting a region with text already in it is often not announced. Keep messages short; avoid announcing every keystroke.

## Colour and visual design

| Requirement (WCAG AA) | Ratio |
|---|---|
| Normal text | 4.5 : 1 |
| Large text (24 px, or 18.66 px bold) | 3 : 1 |
| UI components and graphical objects (borders, icons, focus rings) | 3 : 1 |

- Don't convey meaning by colour alone (add icons, text, patterns).
- Support 200% zoom and 320 px reflow without horizontal scrolling.
- Respect `prefers-reduced-motion`; avoid flashing content.
- Target size at least 24×24 CSS px (WCAG 2.2 AA).

## Worked example: making a custom dropdown accessible

A design calls for a styled "Sort by" dropdown, built from `div`s. An audit finds: it can't be reached with Tab, opens only on mouse click, the screen reader announces "clickable, Newest", and the open list traps nothing and announces nothing.

First question: **does it need to be custom?** A native `<select>` is accessible by default and can now be styled extensively (including `appearance: base-select` where supported). If a native control fits, use it.

If it must be custom, it's a **listbox** pattern (or a menu-button, if the items are actions):

```html
<label id="sort-label">Sort by</label>
<button id="sort-button" aria-haspopup="listbox" aria-expanded="false"
        aria-labelledby="sort-label sort-button">Newest</button>
<ul id="sort-list" role="listbox" aria-labelledby="sort-label" tabindex="-1" hidden>
  <li id="opt-newest" role="option" aria-selected="true">Newest</li>
  <li id="opt-price" role="option" aria-selected="false">Price: low to high</li>
  <li id="opt-rating" role="option" aria-selected="false">Rating</li>
</ul>
```

Behaviour to implement:

| Key or action | Expected behaviour |
| --- | --- |
| Enter, Space or ↓ on the button | Open the list, focus it, highlight the selected option |
| ↑ / ↓ | Move the active option (`aria-activedescendant` on the list points at it) |
| Home / End | First / last option |
| Typing letters | Jump to the next option starting with those letters |
| Enter | Select the active option, close, return focus to the button, update its text |
| Escape | Close without changing, return focus to the button |
| Tab | Close and move on normally |
| Click outside | Close |

Then verify: tab to it, operate it with only the keyboard, listen with a screen reader (VoiceOver, NVDA) and check that the name, role, state ("collapsed", "expanded") and selected value are announced. This amount of work for one widget is the best argument for native elements and well-tested component libraries.

## The WCAG principles in practice

WCAG organises its success criteria under four principles, POUR:

| Principle | Meaning | Typical checks |
| --- | --- | --- |
| Perceivable | Users can perceive the content | Text alternatives, captions, contrast (4.5:1 for body text), no information by colour alone |
| Operable | Users can operate the interface | Everything works with a keyboard, visible focus, no keyboard traps, enough time, targets at least 24×24 px |
| Understandable | Users can understand content and behaviour | Labels and instructions, predictable navigation, helpful error messages, page language set |
| Robust | Works with assistive technologies | Valid semantics, correct names, roles and states for custom widgets |

Most teams target WCAG 2.2 level AA, which is also what most accessibility laws reference.

## Accessibility in a single-page app

Client-side routing breaks two things the browser normally does on navigation: it announces the new page and resets focus. Restore both:

```js
function onRouteChange(title) {
  document.title = `${title} — Acme`
  const heading = document.querySelector('main h1')
  heading.setAttribute('tabindex', '-1') // focusable by script, not by Tab
  heading.focus() // screen readers announce the new page's heading
}
```

Other SPA concerns: announce async results ("12 results loaded") through a polite live region, keep focus stable when content re-renders, and make loading states perceivable (`aria-busy` on the region, not just a spinner).

## Testing

1. **Automated**: axe-core (browser extension, `@axe-core/playwright`, `jest-axe`), Lighthouse. Catches roughly a third of issues: missing alt/labels, contrast, invalid ARIA.
2. **Keyboard pass**: unplug the mouse; Tab through everything; check focus visibility, order, traps, Escape.
3. **Screen readers**: VoiceOver + Safari (macOS/iOS), NVDA + Firefox or Chrome (Windows), TalkBack (Android). Check names, roles, states, announcements.
4. **Zoom and reflow**: 200% and 400%, narrow viewport.
5. **Accessibility tree**: DevTools Accessibility pane shows computed name and role.
6. **Tests**: query by role and name (`getByRole('button', { name: 'Save' })`) in Testing Library; it fails when semantics are wrong.

## Common interview questions

**What is the first rule of ARIA?**
Don't use ARIA when a native HTML element or attribute provides the semantics and behaviour; ARIA only describes, it doesn't implement.

**How would you make a custom dropdown accessible?**
Prefer native `<select>`. Otherwise implement the APG combobox or listbox pattern: correct roles and states, `aria-activedescendant` or roving focus, full keyboard support, Escape to close, focus return, and an accessible name.

**What's roving tabindex?**
A composite widget is one tab stop: the active item has `tabindex="0"`, others `-1`, and arrow keys move focus and update which item holds `0`.

**`aria-hidden` vs `hidden` vs `inert`?**
`aria-hidden` hides from AT but not visually; `hidden` hides from everyone; `inert` keeps it visible but makes it non-interactive and hidden from AT.

**How do you handle focus on route change in a SPA?**
Move focus to the new page heading or main region, update the title, and optionally announce via a polite live region.

**Can automated tools guarantee accessibility?**
No. They catch a minority of issues. Keyboard and screen reader testing are required.

## Pitfalls

- `outline: none` without a replacement focus style.
- Click handlers on `div`s and `span`s.
- `aria-label` on non-interactive generic elements (often ignored).
- Positive `tabindex`.
- Live region added at the same moment as its message.
- Icon buttons with no accessible name.
- Modal that doesn't return focus to its trigger.

## Key takeaways

- Native HTML elements carry roles, names, states and keyboard behaviour; use them first.
- Every control needs an accessible name; check it in the accessibility tree.
- ARIA changes what is announced, not how things behave; custom widgets need keyboard support you write yourself.
- Manage focus deliberately: dialogs, route changes and deleted content.
- Announce dynamic updates with live regions; never rely on colour alone.
- Test with the keyboard, a screen reader and automated tools; automation finds only part of the problems.
