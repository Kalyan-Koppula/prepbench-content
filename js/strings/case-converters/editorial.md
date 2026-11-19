**Key insight:** the four converters are trivial once you have a reliable `splitWords`. All the difficulty, and all the interview discussion, is in where word boundaries go inside camel/Pascal input, especially around acronyms.

## Approach

1. Mark camel boundaries: `replace(/([a-z0-9])([A-Z])/g, '$1 $2')` splits `userName` and `html5Parser`.
2. Mark acronym boundaries: `replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')` splits `XMLHttp` into `XML Http` while leaving a trailing `ID` alone.
3. `split(/[^A-Za-z0-9]+/)`, `filter(Boolean)`, lowercase each word.
4. Join: camel = first word plus capitalised rest; Pascal = all capitalised; snake = `_`; kebab = `-`.

## Walkthrough

`toSnakeCase('parseXMLHttpRequest')`:

| Step | Result |
| --- | --- |
| Insert a space between a lower-case letter or digit and an upper-case letter | `parse XMLHttp Request` |
| Insert a space inside an acronym before a capitalised word | `parse XML Http Request` |
| Split on anything that isn't a letter or digit; drop empties | `['parse', 'XML', 'Http', 'Request']` |
| Lower-case each word | `['parse', 'xml', 'http', 'request']` |
| Join with `_` | `parse_xml_http_request` |

Every converter shares the same `splitWords` step and differs only in how words are joined and capitalised, so `toCamelCase('Hello_world-again')` gives `helloWorldAgain`.

## Complexity

`O(n)` per conversion.

## Edge cases to test

- Each input style: camel, Pascal, snake, kebab, spaced, mixed.
- Acronyms (`XMLHttpRequest`, `userID`).
- Digits (`version2Beta`).
- Leading, trailing and repeated separators.
- Empty strings.

## Pitfalls

- Only handling `_` and `-`: `toSnakeCase('fooBar')` then returns `foobar`.
- Splitting before every capital (`/(?=[A-Z])/`): `XMLHttpRequest` becomes `x_m_l_http_request`.
- Lowercasing before finding boundaries, which destroys the information you need.
- Splitting on `' '` only, so double spaces or leading separators create empty words and `__a` becomes `_a`.
- Splitting digits off (`version_2_update`); the statement keeps them with the preceding word.

## Follow-ups interviewers add

- **Preserve acronyms:** `toCamelCase('user_id', { acronyms: ['ID'] })` gives `userID`.
- **Unicode letters:** use `\p{Lu}` / `\p{Ll}` with the `u` flag so `ÉtatCivil` splits correctly.
- **Deep key conversion:** convert every key of a nested API response from snake to camel (and why you must not touch values).
- **TypeScript:** a `CamelCase<'foo_bar'>` template-literal type.

## In the interview

Show the "split into words once, then join" design; it's what makes four converters short and consistent. Acronyms are where interviewers probe.
