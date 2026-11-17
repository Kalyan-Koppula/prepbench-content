**Key insight:** the four converters are trivial once you have a reliable `splitWords`. All the difficulty, and all the interview discussion, is in where word boundaries go inside camel/Pascal input, especially around acronyms.

## Approach

1. Mark camel boundaries: `replace(/([a-z0-9])([A-Z])/g, '$1 $2')` splits `userName` and `html5Parser`.
2. Mark acronym boundaries: `replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')` splits `XMLHttp` into `XML Http` while leaving a trailing `ID` alone.
3. `split(/[^A-Za-z0-9]+/)`, `filter(Boolean)`, lowercase each word.
4. Join: camel = first word plus capitalised rest; Pascal = all capitalised; snake = `_`; kebab = `-`.

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
