---
title: Typing React Components
order: 3
summary: Props, children, events, refs in React 19, generic and polymorphic-ish components, discriminated-union props, typed context and custom hooks.
---

When a company uses React with TypeScript, the machine-coding round is often in `.tsx`, and reviewers notice whether your props model the component's real states or are a pile of optionals and `any`. The patterns below cover nearly everything those rounds need, updated for React 19 typings.

## Props

```tsx
type ButtonProps = {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md'
  loading?: boolean
} & React.ComponentProps<'button'>

export function Button({ variant = 'primary', size = 'md', loading = false, children, ...rest }: ButtonProps) {
  return (
    <button {...rest} className={`btn btn-${variant} btn-${size}`} disabled={loading || rest.disabled}>
      {loading ? 'Saving…' : children}
    </button>
  )
}
```

- Type props as a plain function parameter; `React.FC` is no longer needed and adds nothing useful.
- Extend native element props with `React.ComponentProps<'button'>` so `onClick`, `type`, `aria-*` and `ref` pass through. Use `ComponentPropsWithoutRef<'button'>` when you deliberately don't forward a ref.
- Use `Omit<React.ComponentProps<'input'>, 'size'>` when your prop name collides with a native attribute.
- Default values go in destructuring, not `defaultProps` (removed for function components in React 19).
- `React.ComponentProps<typeof OtherComponent>` extracts another component's props, useful for wrappers.

## Children

| Type | Accepts |
|---|---|
| `React.ReactNode` | Anything renderable: elements, strings, numbers, arrays, `null`, `undefined`, booleans |
| `React.ReactElement` | A single JSX element only |
| `(data: T) => React.ReactNode` | Render prop or function-as-children |
| `string` | Text only, e.g. a `Tooltip` label |

```tsx
type CardProps = { title: string; children: React.ReactNode; footer?: React.ReactNode }
type ListProps<T> = { items: T[]; children: (item: T) => React.ReactNode }
```

`React.PropsWithChildren<P>` adds an optional `children?: ReactNode`; spelling it out is usually clearer. Components may return `ReactNode` in React 19 typings, including strings and `undefined`.

## Events

```tsx
function SearchBox({ onSearch }: { onSearch: (q: string) => void }) {
  const [q, setQ] = React.useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setQ(e.target.value)
  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Escape') setQ('')
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSearch(q) }}>
      <input value={q} onChange={handleChange} onKeyDown={handleKeyDown} />
      <button onClick={(e) => console.log(e.currentTarget.form)}>Go</button>
    </form>
  )
}
```

- Inline handlers infer the event type from the JSX attribute, so annotate only extracted handlers.
- `React.MouseEvent<HTMLButtonElement>`, `React.KeyboardEvent<…>`, `React.FocusEvent<…>`, `React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>`.
- For form submit, recent `@types/react` versions provide `React.SubmitEvent<HTMLFormElement>` (with `submitter`) and deprecate `FormEvent`; older code uses `React.FormEvent<HTMLFormElement>`.
- `currentTarget` is typed as the element the handler is attached to; `target` may be any descendant, so it's typed loosely for bubbling events.
- Callback props: name them by intent (`onSelect(id: string)`), not by DOM event, and pass data, not the event.

## Refs: React 19 vs `forwardRef`

```tsx
// React 19: ref is a regular prop on function components
function TextInput({ label, ref, ...rest }: { label: string } & React.ComponentProps<'input'>) {
  return (
    <label>
      {label}
      <input ref={ref} {...rest} />
    </label>
  )
}

// React 18 and earlier: forwardRef
const OldTextInput = React.forwardRef<HTMLInputElement, { label: string }>(
  function OldTextInput({ label }, ref) {
    return <label>{label}<input ref={ref} /></label>
  },
)

function Form() {
  const inputRef = React.useRef<HTMLInputElement>(null) // RefObject<HTMLInputElement | null>
  return <TextInput label="Name" ref={inputRef} onFocus={() => inputRef.current?.select()} />
}
```

- In React 19, `useRef` requires an argument, and its `.current` is always mutable; `MutableRefObject` is deprecated.
- `forwardRef` still works but is slated for deprecation, and it loses generic type parameters, which is one more reason to prefer ref-as-prop.
- Exposing an imperative API: type the handle and use `useImperativeHandle(ref, () => ({ focus, clear }), [])` with `ref: React.Ref<InputHandle>`.
- Ref callbacks may return a cleanup function in React 19; with implicit-return arrows like `ref={(el) => (node = el)}` that's now a type error, so use a block body.

## Generic components

```tsx
type SelectProps<T> = {
  options: readonly T[]
  value: T | null
  onChange: (value: T) => void
  getLabel: (option: T) => string
  getKey: (option: T) => string
}

function Select<T>({ options, value, onChange, getLabel, getKey }: SelectProps<T>) {
  return (
    <ul role="listbox">
      {options.map((o) => (
        <li key={getKey(o)} role="option" aria-selected={o === value} onClick={() => onChange(o)}>
          {getLabel(o)}
        </li>
      ))}
    </ul>
  )
}

// T inferred as User; onChange receives a User
const picker = <Select options={users} value={selected} onChange={setSelected} getLabel={(u) => u.name} getKey={(u) => u.id} />
```

In a `.tsx` file, a generic arrow needs a trailing comma or constraint to avoid being parsed as JSX: `const Select = <T,>(props: SelectProps<T>) => …`. Function declarations avoid the issue.

## Discriminated-union props

```tsx
type LinkOrButtonProps =
  | ({ as: 'link'; href: string } & Omit<React.ComponentProps<'a'>, 'href'>)
  | ({ as?: 'button' } & React.ComponentProps<'button'>)

function Action(props: LinkOrButtonProps) {
  if (props.as === 'link') {
    const { as, ...rest } = props
    return <a {...rest} />
  }
  const { as, ...rest } = props
  return <button type="button" {...rest} />
}

const docs = <Action as="link" href="/docs">Docs</Action>
const saveButton = <Action onClick={() => save()}>Save</Action>
const broken = <Action as="link">Docs</Action> // error: href is required
```

Other places this pattern pays off: controlled vs uncontrolled inputs (`value` + `onChange` together, or `defaultValue`), modal variants, and async state props. To forbid a prop in one branch, give it type `never`: `{ variant: 'icon'; label?: never; 'aria-label': string }`.

Narrowing works on `props.as`. Destructuring the discriminant in the parameter list also narrows in TS 4.6+ as long as the destructured variables are `const` and not reassigned.

## Context

```tsx
type AuthContextValue = { user: User | null; login: (u: User) => void; logout: () => void }

const AuthContext = React.createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null)
  const value = React.useMemo(() => ({ user, login: setUser, logout: () => setUser(null) }), [user])
  return <AuthContext value={value}>{children}</AuthContext> // React 19: no .Provider needed
}

export function useAuth() {
  const ctx = React.use(AuthContext) // or useContext
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx // AuthContextValue, null excluded
}
```

Defaulting to `null` and throwing in the hook avoids the `{} as AuthContextValue` lie and gives a clear error when the provider is missing.

## Typing custom hooks

```tsx
function useToggle(initial = false) {
  const [on, setOn] = React.useState(initial)
  const toggle = React.useCallback(() => setOn((v) => !v), [])
  return [on, toggle] as const // readonly [boolean, () => void], not (boolean | (() => void))[]
}

type FetchState<T> =
  | { status: 'idle' | 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error }

function useFetch<T>(url: string, parse: (json: unknown) => T): FetchState<T> {
  const [state, setState] = React.useState<FetchState<T>>({ status: 'idle' })
  React.useEffect(() => {
    const controller = new AbortController()
    setState({ status: 'loading' })
    fetch(url, { signal: controller.signal })
      .then((r) => r.json())
      .then((json) => setState({ status: 'success', data: parse(json) }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setState({ status: 'error', error: error instanceof Error ? error : new Error(String(error)) })
      })
    return () => controller.abort()
  }, [url, parse])
  return state
}
```

- Return tuples with `as const`, or return an object when there are more than two values.
- Give `useState` an explicit type when the initial value doesn't describe all states: `useState<User | null>(null)`, `useState<string[]>([])`.
- Type reducers with a discriminated `Action` union; `useReducer` infers state and dispatch from the reducer.
- Accept a `parse` or validator function instead of asserting `as T` on JSON.

## Common interview questions

**Should components use `React.FC`?**
It's no longer recommended by most teams. A plain function with typed props is simpler, supports generics, and since React 18 typings `FC` no longer adds implicit `children` anyway.

**How do refs change in React 19?**
Function components receive `ref` as a normal prop, so `forwardRef` isn't needed and generic components can accept refs. `useRef` requires an initial value and ref callbacks can return cleanup functions.

**How do you type a component that wraps a native input?**
Intersect your own props with `React.ComponentProps<'input'>`, omitting any names you redefine, and spread the rest onto the element. That keeps every native attribute and the ref available to callers.

**How do you make two props mutually required?**
Use a discriminated union of prop shapes, optionally with `never` on the forbidden props of each branch. The compiler then rejects invalid combinations at the call site.

**Why default a context to `null` instead of an empty object cast?**
The cast lies to the type system and turns a missing provider into confusing runtime errors. A `null` default with a hook that throws gives precise types inside the provider and a clear message outside it.

**How do you write a generic component in a `.tsx` file?**
Use a function declaration with `<T>`, or an arrow with `<T,>` so the parser doesn't read it as JSX. TypeScript infers `T` from props like `options` at the call site.

**How should a custom hook return multiple values?**
Return a tuple with `as const` for two closely related values like `[value, setValue]`, so destructuring keeps each position's type. For more than two, return an object so callers can pick by name.
