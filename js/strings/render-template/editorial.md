**Key insight:** one `String.prototype.replace` with a global regex and a callback does the scanning for you. The regex decides what counts as a placeholder; the callback only resolves a path and decides whether to escape.

## Approach

1. Path grammar: `[\w$]+(?:\.[\w$]+)*`. Build `\{\{\{\s*(PATH)\s*\}\}\}|\{\{\s*(PATH)\s*\}\}` with the triple-brace branch first, so `{{{x}}}` is not read as `{{` + `{x}}}`.
2. In the callback, whichever capture group matched tells you raw vs escaped.
3. `lookup(data, path)`: split on `.`, and for each key return `undefined` if the current value is nullish or lacks an *own* property `key`.
4. `null`/`undefined` become `''`; everything else is `String(value)`, escaped with a single-pass `replace(/[&<>"']/g, ch => map[ch])` unless raw.

## Walkthrough

`renderTemplate('<p>Hi {{ user.name }}! {{{ bio }}}</p>', { user: { name: '<Ana>' }, bio: '<em>dev</em>' })`:

| Placeholder | Path | Value | Escaped? | Output |
| --- | --- | --- | --- | --- |
| `{{ user.name }}` | `user.name` | `<Ana>` | yes (double braces) | `&lt;Ana&gt;` |
| `{{{ bio }}}` | `bio` | `<em>dev</em>` | no (triple braces) | `<em>dev</em>` |

Result: `<p>Hi &lt;Ana&gt;! <em>dev</em></p>`. Missing values render as empty strings; only own properties are looked up, so `{{ constructor }}` doesn't leak `Object`.

## Complexity

`O(n)` over the template plus path lookups.

## Edge cases to test

- Escaped and raw placeholders.
- Nested paths and missing paths.
- Whitespace inside braces.
- `0` and `false` render (only `null`/`undefined` are empty).
- Prototype properties aren't exposed.

## Pitfalls

- Chained `.replace('&', …).replace('<', …)` in the wrong order double-escapes, and without `/g` only replaces the first occurrence.
- `value || ''` turns `0` and `false` into empty strings.
- `data[key]` without an own-property check renders `function Object() { [native code] }` for `{{ constructor }}`, and can leak more than you meant to expose.
- A lazy `\{\{(.*?)\}\}` swallows invalid content like `{{ two words }}` and has to be re-validated.

## Follow-ups interviewers add

- **Sections and loops:** `{{#items}}…{{/items}}` and conditionals; at that point you need a tokenizer, not one regex.
- **Filters:** `{{ price | currency }}` with a map of formatter functions.
- **Compile once:** pre-parse the template into a function for repeated renders.
- **Security:** why escaping is context-dependent (attributes, URLs, `<script>`), and what React does for you.

## In the interview

Highlight escaping by default as the security decision, with raw output as an explicit opt-in. Extensions: sections and loops (`{{#items}}`), partials, and compiling the template once into a function.
