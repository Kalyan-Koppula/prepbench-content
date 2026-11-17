---
title: Forms and Validation
order: 2
summary: Labels, input types, FormData, native constraint validation and its API, button types, progressive enhancement and the accessibility failures interviewers spot in forms.
---

Forms show up in almost every machine-coding prompt (sign-up, checkout, search, settings), and they are where hand-rolled UIs break most often: missing labels, buttons that submit unexpectedly, errors nobody can hear. The platform already handles collection, validation and submission; strong candidates lean on it and add JavaScript on top.

## Labels and accessible names

```html
<!-- Explicit: for/id -->
<label for="email">Email</label>
<input id="email" name="email" type="email" autocomplete="email" required />

<!-- Implicit: wrapping -->
<label>
  <input type="checkbox" name="terms" required /> I accept the terms
</label>

<!-- Extra description, linked to the input -->
<label for="pw">Password</label>
<input id="pw" name="password" type="password" autocomplete="new-password"
       minlength="12" aria-describedby="pw-hint" required />
<p id="pw-hint">At least 12 characters.</p>
```

- A `<label>` gives the input its accessible name and makes clicking the label focus or toggle the control.
- `placeholder` is not a label: it disappears on input, often fails contrast, and isn't reliably announced.
- Group related controls (radio sets, address blocks) in `<fieldset>` with a `<legend>`; the legend is announced as context for each control.
- `aria-label` is the fallback when there's no visible text, such as an icon-only search button.

## Input types and attributes

| Type | Gives you |
|---|---|
| `email`, `url` | Format validation, matching mobile keyboard |
| `tel` | Phone keypad; no format validation (formats vary) |
| `number` | Spinner, `min`/`max`/`step`; avoid for IDs, card numbers, ZIP codes |
| `date`, `time`, `datetime-local` | Native pickers, normalized `value` (`YYYY-MM-DD`) |
| `search` | Clear button on some platforms, `search` keyboard action |
| `checkbox`, `radio` | Radios with the same `name` form one group, one tab stop |
| `file` | `accept`, `multiple`; read via `input.files` |
| `password` | Masked; pair with correct `autocomplete` for password managers |

Useful attributes: `autocomplete` (`email`, `name`, `street-address`, `one-time-code`, `current-password`, `new-password`), `inputmode` (`numeric`, `decimal`) for a keyboard without number-type semantics, `enterkeyhint`, and `spellcheck="false"` for usernames and codes.

For a card or OTP field, prefer `type="text" inputmode="numeric" autocomplete="cc-number"` over `type="number"`, which drops leading zeros and changes value on scroll.

## name, value and FormData

Only controls with a `name` are submitted. Unchecked checkboxes and disabled controls are omitted entirely.

```js
form.addEventListener('submit', async (e) => {
  e.preventDefault()
  const data = new FormData(form)            // or new FormData(form, e.submitter)
  data.get('email')                           // string, or null if absent
  data.getAll('tags')                         // for repeated names / multi-select
  const json = Object.fromEntries(data)       // loses repeated keys; fine for flat forms

  await fetch('/api/signup', { method: 'POST', body: data }) // multipart/form-data
  // or: body: new URLSearchParams(data) for application/x-www-form-urlencoded
})
```

- Passing `e.submitter` to `FormData` includes the clicked button's `name`/`value`, useful for "Save draft" vs "Publish".
- Don't set `Content-Type` manually with a `FormData` body; the browser adds the multipart boundary.
- `form.elements.email` and `form.elements.namedItem('email')` access controls by name.
- `readonly` fields submit; `disabled` fields don't, and aren't focusable.

## Native constraint validation

```html
<form id="signup">
  <input name="username" required minlength="3" maxlength="20"
         pattern="[a-z0-9_]+" title="Lowercase letters, digits and underscores" />
  <input name="age" type="number" min="13" max="120" step="1" />
  <input name="site" type="url" />
  <button>Create account</button>
</form>
```

On submit, the browser checks every control; if any are invalid it cancels submission, focuses the first invalid one and shows a native message. CSS hooks: `:invalid`, `:valid`, `:required`, and `:user-invalid` (only after the user has interacted, which avoids red fields on page load).

`pattern` is anchored automatically (it must match the whole value) and is compiled with the `v` flag in current browsers, so some characters need escaping inside classes.

## The Constraint Validation API

```js
const pw = form.elements.password
const confirm = form.elements.confirm

confirm.addEventListener('input', () => {
  confirm.setCustomValidity(confirm.value === pw.value ? '' : 'Passwords must match')
})

// With <form novalidate>, submit fires even when fields are invalid, so check yourself
form.addEventListener('submit', (e) => {
  if (!form.checkValidity()) {          // fires 'invalid' on each bad control
    e.preventDefault()
    showErrors(form)
  }
})

input.validity           // ValidityState: valueMissing, typeMismatch, patternMismatch,
                         // tooShort, tooLong, rangeUnderflow, rangeOverflow,
                         // stepMismatch, badInput, customError, valid
input.validationMessage  // the localized message the browser would show
input.reportValidity()   // check and show the message now
```

`setCustomValidity('')` clears the custom error; forgetting to clear it leaves the field permanently invalid. To show your own messages instead of the browser bubbles, add `novalidate` to the form and render errors yourself while still using `validity` to decide what's wrong.

### Accessible custom errors

```html
<label for="email">Email</label>
<input id="email" name="email" type="email" required
       aria-invalid="true" aria-describedby="email-error" />
<p id="email-error" class="error">Enter an email like name@example.com.</p>
```

- Set `aria-invalid="true"` only after validation fails, and link the message with `aria-describedby`.
- On submit with errors, move focus to the first invalid field or to an error summary with links to each field.
- Validate on blur or submit, not on every keystroke while the user is still typing.
- Always validate again on the server; client validation is a UX feature, not a security boundary.

## Button types

```html
<form>
  <button>Submit</button>                   <!-- type defaults to "submit" -->
  <button type="button">Preview</button>    <!-- does nothing unless you add JS -->
  <button type="reset">Reset</button>       <!-- rarely what users want -->
  <button formaction="/draft" formnovalidate>Save draft</button>
</form>
```

The default `type="submit"` is the classic bug: a "Show password" or "Add row" button inside a form submits it. Pressing Enter in a text field submits the form via its default button (implicit submission), which works only if a submit button exists or the form has a single text input.

## Submission with and without JavaScript

```html
<form action="/search" method="get" role="search">
  <label for="q">Search products</label>
  <input id="q" name="q" type="search" />
  <button>Search</button>
</form>
```

- Without JS, `GET` serializes fields into the query string (`/search?q=shoes`), giving shareable URLs. `POST` sends the body and is used for mutations.
- `method="dialog"` closes the enclosing `<dialog>`.
- With JS, intercept `submit` (not the button's `click`, which misses Enter-key submission), call `preventDefault()`, send with `fetch`, and handle pending, success and error states: disable the submit button or guard against double submit.
- `form.requestSubmit(button)` triggers validation and the `submit` event; `form.submit()` skips both.

## Progressive enhancement

Start with a form that works as plain HTML posting to a server endpoint, then enhance: client validation messages, inline async checks, optimistic UI. React 19 fits this model: `<form action={fn}>` accepts a function, `useActionState` tracks the result and pending state, and `useFormStatus` reads the parent form's pending state from a child button. With server actions, the form can submit before hydration finishes.

## Common accessibility failures in forms

- Inputs with only a placeholder or a visually adjacent `div` as the "label".
- Radio groups without `fieldset`/`legend`, so "Yes" and "No" have no question.
- Errors shown only in red, or only as a toast, not linked to the field.
- Required fields marked only with a red asterisk and no text or `required` attribute.
- Custom selects and checkboxes built from `div`s without keyboard support.
- Disabled submit buttons with no explanation of what's missing.
- Focus lost after submit, or moved to the top of the page without announcing the result.
- Timeouts that clear the form without warning.

## Common interview questions

**Why intercept `submit` rather than the button's `click`?**
Forms can be submitted by pressing Enter in a field, by `requestSubmit`, or by other submit buttons. The `submit` event catches all of them in one place and runs after native validation passes.

**What's the difference between `disabled` and `readonly`?**
`readonly` fields can be focused and selected and are submitted; `disabled` fields are skipped by keyboard focus and excluded from submission. Use `readonly` for values the user should see and send but not edit.

**How do you validate that two passwords match with native validation?**
Call `setCustomValidity('Passwords must match')` on the confirm field when they differ and `setCustomValidity('')` when they match, typically in an `input` listener. The form then blocks submission like any other constraint.

**Why not use `type="number"` for a credit card or ZIP code?**
They're identifiers, not quantities: `number` strips leading zeros, allows `e` and decimals, and can change on mouse wheel. Use `type="text"` with `inputmode="numeric"` and an `autocomplete` token.

**How do you make form errors accessible?**
Associate each message with its input through `aria-describedby`, set `aria-invalid`, and move focus to the first error or an error summary on submit. Don't rely on colour alone.

**What does `FormData` include?**
Every successful control with a `name`: enabled inputs, checked checkboxes and radios, selected options, and files. It skips disabled controls, unchecked boxes and buttons unless you pass the submitter.

**What does progressive enhancement mean for a form?**
The form works with plain HTML and a server endpoint, and JavaScript improves the experience rather than being required. It protects against failed script loads and slow hydration, and it usually produces better semantics.
