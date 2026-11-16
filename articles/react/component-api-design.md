---
title: Component API Design
order: 6
summary: Controlled vs uncontrolled, compound components, render props vs hooks, polymorphic as props, refs in React 19, and building reusable components that are accessible by default.
---

Senior and design-system interviews ask you to design a component's API: "build a reusable Tabs / Select / Modal". They grade the props surface, flexibility vs simplicity, how state is owned, and whether keyboard and screen-reader users are covered without extra work from the consumer.

## Principles

- **Small, predictable surface.** Fewer props with clear names beat a config object with 40 options.
- **Composition over configuration.** Let consumers pass children instead of adding `renderHeader`, `headerIcon`, `headerClassName`...
- **Follow the platform.** Mirror native names (`value`, `defaultValue`, `onChange`, `disabled`) and spread remaining props onto the root element.
- **Accessible by default.** Roles, labels, keyboard handling built in, not left to the consumer.
- **Escape hatches.** `className`, `style`, `ref`, and data attributes reach the right element.

## Controlled vs uncontrolled

| | Controlled | Uncontrolled |
|---|---|---|
| Source of truth | Parent via `value` + `onChange` | Component's own state (or the DOM) |
| Initial value | `value` | `defaultValue` |
| Parent can reset/validate on every change | Yes | Only via key reset or ref |
| Boilerplate | More | Less |

Good reusable components support **both**: controlled when `value` is provided, otherwise internal state.

```tsx
function useControllableState<T>({
  value, defaultValue, onChange,
}: { value?: T; defaultValue: T; onChange?: (v: T) => void }) {
  const [internal, setInternal] = useState(defaultValue)
  const isControlled = value !== undefined
  const current = isControlled ? value : internal
  const setValue = useCallback((next: T) => {
    if (!isControlled) setInternal(next)
    onChange?.(next)
  }, [isControlled, onChange])
  return [current, setValue] as const
}
```

Don't switch between controlled and uncontrolled during a component's life (React warns for inputs). `undefined` means uncontrolled; use `null` or `''` for "empty but controlled".

## Compound components

A parent owns state and shares it with flexible children through context. Consumers compose the structure; the component handles wiring.

```tsx
const TabsContext = createContext<{ value: string; setValue: (v: string) => void; id: string } | null>(null)
function useTabs() {
  const ctx = useContext(TabsContext)
  if (!ctx) throw new Error('Tabs.* must be used inside <Tabs>')
  return ctx
}

function Tabs({ defaultValue, children }: { defaultValue: string; children: React.ReactNode }) {
  const [value, setValue] = useState(defaultValue)
  const id = useId()
  return <TabsContext value={{ value, setValue, id }}>{children}</TabsContext>
}

function Tab({ value, children }: { value: string; children: React.ReactNode }) {
  const t = useTabs()
  const selected = t.value === value
  return (
    <button role="tab" id={`${t.id}-tab-${value}`} aria-selected={selected}
            aria-controls={`${t.id}-panel-${value}`} tabIndex={selected ? 0 : -1}
            onClick={() => t.setValue(value)}>
      {children}
    </button>
  )
}

function TabPanel({ value, children }: { value: string; children: React.ReactNode }) {
  const t = useTabs()
  return t.value === value ? (
    <div role="tabpanel" id={`${t.id}-panel-${value}`} aria-labelledby={`${t.id}-tab-${value}`} tabIndex={0}>
      {children}
    </div>
  ) : null
}

Tabs.Tab = Tab
Tabs.Panel = TabPanel
```

(A full Tabs also needs a `role="tablist"` wrapper with arrow-key roving focus; see the accessibility track.)

Why it's preferred for complex widgets: consumers control order, wrapping and styling of parts; no prop explosion; state stays encapsulated. Libraries such as Radix and React Aria use this shape.

## Render props vs hooks

| Pattern | Shape | Still useful for |
|---|---|---|
| Render prop | `<Downshift>{(api) => ...}</Downshift>` | Rendering inside a specific DOM context (virtual list rows, positioned layers), or when the component must own markup |
| Higher-order component | `withAuth(Component)` | Mostly legacy; wrapping at module level, e.g. route guards |
| Custom hook | `const api = useCombobox(opts)` | Sharing stateful logic; the default today |
| Headless component + hook | Hook returns prop getters: `getInputProps()`, `getItemProps(i)` | Full styling freedom with behaviour and a11y included |

```tsx
const { getInputProps, getMenuProps, getItemProps, isOpen } = useCombobox({ items, onSelect })
return (
  <>
    <input {...getInputProps()} />
    <ul {...getMenuProps()}>{isOpen && items.map((it, i) => <li key={it.id} {...getItemProps(i)}>{it.label}</li>)}</ul>
  </>
)
```

Prop getters merge consumer handlers with internal ones (call both) and supply ids and ARIA attributes.

## Polymorphic `as` prop

Lets a component render a different element while keeping its styling and behaviour: `<Button as="a" href="/x">`.

```tsx
type AsProps<E extends React.ElementType> = {
  as?: E
} & Omit<React.ComponentPropsWithRef<E>, 'as'>

function Text<E extends React.ElementType = 'span'>({ as, ...rest }: AsProps<E>) {
  const Comp = as ?? 'span'
  return <Comp {...rest} />
}

<Text as="label" htmlFor="email">Email</Text>
```

Trade-offs: TypeScript types get complex and slow; consumers can pick semantically wrong elements (a `div` "button"). The **`asChild` / Slot** pattern (Radix) is an alternative: the component merges its props onto its single child, so the consumer supplies the element and its types.

```tsx
<Button asChild><a href="/pricing">Pricing</a></Button>
```

## Refs: React 19 `ref` as a prop

In React 19, function components receive `ref` as an ordinary prop. `forwardRef` is unnecessary (and will be deprecated).

```tsx
function Input({ ref, label, ...props }: React.ComponentProps<'input'> & { label: string }) {
  const id = useId()
  return (
    <>
      <label htmlFor={id}>{label}</label>
      <input id={id} ref={ref} {...props} />
    </>
  )
}
```

- Forward the ref to the element consumers will want to focus, measure or position against.
- `useImperativeHandle(ref, () => ({ focus, scrollToItem }))` exposes a limited imperative API instead of the raw node. Keep it small; prefer declarative props.
- When you need both an internal ref and the forwarded one, merge them with a ref callback.

## Building accessible reusable components

Checklist an interviewer will look for:

1. **Native element first**: `<button>`, `<a href>`, `<input>`, `<dialog>`, `<select>`, `<details>`. Custom widgets only when native can't do it.
2. **Accessible name**: label prop required (or `aria-label` / `aria-labelledby` accepted). Icon-only buttons must still get a name.
3. **Ids via `useId`**, never hard-coded, so multiple instances don't collide and SSR matches.
4. **Keyboard support** per the APG pattern (Tab, arrows, Home/End, Escape, Enter/Space).
5. **Focus management**: move focus into dialogs and menus on open, return it on close, visible focus styles.
6. **State exposed with ARIA**: `aria-expanded`, `aria-selected`, `aria-checked`, `aria-invalid`, `aria-describedby` for errors and hints.
7. **Don't block consumer props**: spread rest props, compose event handlers instead of overwriting them.
8. **Motion and colour**: respect `prefers-reduced-motion`, don't convey state by colour alone.

```tsx
function composeHandlers<E>(theirs?: (e: E) => void, ours?: (e: E) => void) {
  return (e: E) => {
    theirs?.(e)
    if (!(e as { defaultPrevented?: boolean }).defaultPrevented) ours?.(e)
  }
}
```

## API design checklist

- Is every prop necessary? Could it be children instead?
- Are names consistent with HTML and the rest of the library (`disabled` not `isDisabled` in one place and `disabled` in another)?
- Does it work controlled and uncontrolled?
- Is the ref forwarded to the right element? Are `className` and rest props applied?
- Can it be server-rendered (no `window` in render, ids from `useId`)?
- Is the default behaviour accessible with zero configuration?
- Is there a clear error when parts are used outside their parent?

## Common interview questions

**When should a component be controlled?**
When the parent needs to read, validate, transform or reset the value on every change, or sync it with other state. Otherwise uncontrolled is simpler; reusable components should support both.

**Why use compound components instead of props?**
They let consumers arrange and style sub-parts freely while the parent keeps state and wiring in context. Avoids prop explosion like `tabLabels`, `tabIcons`, `renderPanel`.

**Render props or hooks?**
Hooks for sharing logic; render props when the provider must control where and how something renders. Headless hooks with prop getters combine both benefits.

**How do refs work in React 19?**
`ref` is a normal prop on function components, so just destructure and pass it on. Use `useImperativeHandle` to expose a custom handle.

**What's the downside of a polymorphic `as` prop?**
Complex, slow generic types and easy misuse of semantics. `asChild` (Slot) is a simpler alternative.

**How do you make a reusable component accessible?**
Start with native elements, require an accessible name, generate ids with `useId`, implement the APG keyboard pattern, manage focus, and expose state through ARIA attributes.

## Pitfalls

- Mirroring `value` into internal state and ignoring later changes.
- Overwriting consumer `onClick`/`onKeyDown` instead of composing.
- Hard-coded ids that collide across instances.
- `div` with `onClick` instead of `button`.
- Boolean prop explosions (`primary`, `secondary`, `danger` together) instead of one `variant` union.
