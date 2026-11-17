---
title: HTML and Accessibility
order: 24
module: html
summary: Semantic elements and landmarks, document head essentials, forms and validation, responsive images, dialog, details and popover, ARIA rules, accessible names, focus and keyboard support, live regions, and contrast.
---

## Why does semantic HTML matter beyond looking tidy?

Native elements map to roles in the accessibility tree, so screen readers announce them correctly and users can navigate by them. Elements like `<button>`, `<a href>` and `<details>` also bring keyboard support and state for free. Search engines, reader modes and translation tools use the same structure, and the markup documents itself.

## Which landmark elements would you use, and how do screen reader users benefit?

`<header>` (banner, when not nested inside article, aside, main, nav or section), `<nav>`, `<main>` (one visible per page), `<aside>` (complementary), `<footer>` (contentinfo), and `<section>` or `<form>` once they have an accessible name. Screen reader users jump between landmarks with a shortcut or rotor, skipping repeated chrome.

## When would you use `<article>`, `<section>` or `<div>`?

`<article>` for self-contained content that would make sense syndicated on its own, like a post, comment or product card. `<section>` for a thematic group of content that has a heading. `<div>` when you only need a styling or layout hook and there's no meaning to convey.

## Why does heading order matter?

Screen reader users navigate by headings and use their levels to understand structure, so skipped levels or headings picked for font size mislead them. Use one `<h1>` for the page topic and nest levels logically, styling with CSS. The old "outline algorithm" that would re-level headings inside sections was never implemented and has been removed from the spec.

## What belongs in a minimal, correct document `<head>`?

`<meta charset="utf-8">` within the first 1024 bytes, a responsive viewport meta, a meaningful `<title>`, a `<meta name="description">`, stylesheets and icons, with `<!doctype html>` and `<html lang="…">` around it all. Preloads, preconnects and social meta come next.

## What happens if you leave out `<!doctype html>`?

The browser renders in quirks mode, emulating old engine bugs in the box model, table layout and inline image spacing, so CSS behaves differently from modern standards mode. The short HTML5 doctype exists purely to trigger standards mode.

## Why set the `lang` attribute on `<html>`?

Screen readers pick pronunciation rules and voice from it, browsers use it to offer translation, and CSS uses it for hyphenation and quotation marks. Mark passages in another language with their own `lang` attribute. A missing or wrong `lang` makes a screen reader read French with English rules.

## What should the viewport meta tag contain, and what should you avoid?

`<meta name="viewport" content="width=device-width, initial-scale=1">` so mobile browsers lay out at the device width instead of a desktop-sized virtual viewport. Avoid `user-scalable=no` or `maximum-scale=1`: they block pinch zoom, an accessibility failure, and iOS Safari ignores them anyway.

## When should something be a link and when a button?

A link (`<a href>`) navigates to a URL: it can be opened in a new tab, bookmarked and copied, and activates with Enter. A button performs an action on the current page, such as submitting, toggling or opening a dialog, and activates with Enter and Space. `<a href="#">` with a click handler, or a clickable `<div>`, breaks those expectations.

## Why does a `<button>` inside a form sometimes submit unexpectedly?

A `<button>` with no `type` defaults to `type="submit"`, so a "Cancel" or "Show password" button inside a form submits it. Give non-submit buttons `type="button"` explicitly. `type="reset"` clears the form and is rarely what users want.

## Why does every input need a `<label>`, and how do you associate one?

The label is the control's accessible name, and clicking it focuses or toggles the control, which enlarges small hit targets. Associate it with `for` matching the input's `id`, or by wrapping the input inside the `<label>`. A placeholder is not a substitute: it disappears on input and is often low contrast.

## Why does a form field need a `name` attribute?

Only controls with a `name` that are enabled and "successful" are included in form submission and in `new FormData(form)`; `id` plays no part in submission. Radio buttons sharing a `name` also form one group, so only one can be checked and arrow keys move between them.

## Which built-in validation attributes would you use before writing JavaScript validation?

`required`, input types like `email`, `url` and `number`, `min`, `max` and `step`, `minlength` and `maxlength`, and `pattern`. Style with `:user-invalid` so errors show only after interaction, use `setCustomValidity` for custom rules, and `reportValidity()` to show messages. `novalidate` on the form turns off the browser UI while keeping the API.

## How do you submit a form with `fetch` and `FormData`?

`new FormData(form)` collects every named, enabled control, including files; pass it straight as the `fetch` body. Don't set `Content-Type` yourself: the browser adds `multipart/form-data` with the correct boundary. `Object.fromEntries(formData)` gives a plain object but keeps only one value for repeated names; use `getAll` for checkbox groups.

## Why group related radio buttons or checkboxes in a `<fieldset>` with a `<legend>`?

The legend becomes the group's label, so a screen reader announces the question ("Delivery speed") along with each option ("Express, radio button"). Without it, users hear isolated options with no context. Disabling the fieldset also disables every control inside it.

## What should `alt` text say, and when should it be empty?

Convey the image's purpose or information in context, not "image of…"; for an image inside a link or button, describe the destination or action. Decorative images get `alt=""` so screen readers skip them. Omitting `alt` altogether is worse: many screen readers then read the file name.

## How do `srcset` and `sizes` work together?

`srcset` lists candidate files with their widths (`hero-800.jpg 800w, hero-1600.jpg 1600w`), and `sizes` tells the browser how wide the image will render per media condition (`(min-width: 60em) 50vw, 100vw`), so it can choose before CSS layout exists. The browser makes the final choice, factoring in pixel density and possibly bandwidth. For fixed-size images, `1x` and `2x` descriptors suffice.

## When would you use `<picture>` instead of `srcset` on an `<img>`?

For art direction, serving a different crop or composition at different viewport sizes via `<source media>`, or for format fallback with `<source type="image/avif">` ahead of a JPEG. The inner `<img>` is required: it carries `alt`, sizing and loading attributes, and is what actually renders.

## What does `loading="lazy"` do, and when shouldn't you use it?

It defers fetching off-screen images and iframes until the user scrolls near them, saving bandwidth on long pages. Don't use it on the LCP or any above-the-fold image, since it delays the most important paint; give that one `fetchpriority="high"` instead.

## Why set `width` and `height` attributes on images?

The browser derives an aspect ratio from them and reserves the right space before the image downloads, preventing layout shift (CLS). With `max-width: 100%; height: auto` in CSS, the image still scales responsively.

## What does `<dialog>` give you for free when opened with `showModal()`?

It renders in the top layer above everything else with a styleable `::backdrop`, makes the rest of the page inert, moves focus into the dialog, closes on Escape (firing `cancel`), and returns focus to the previously focused element when closed. A `<form method="dialog">` inside closes it and sets `returnValue`. `show()` opens it non-modally, without those guarantees.

## When would you use the `popover` attribute instead of a `<dialog>`?

For non-modal overlays like menus, tooltips-with-content and pickers: a `popover` element renders in the top layer, light-dismisses on outside click or Escape, and can be toggled by a button with `popovertarget`, all without JavaScript. Use a modal `<dialog>` when the user must deal with it before continuing and the rest of the page should be inert.

## When would you use `<details>` and `<summary>`?

For a native disclosure widget, such as FAQs or expandable sections. You get keyboard support, an expanded or collapsed state for screen readers, and a `toggle` event without writing JavaScript. Giving several `<details>` the same `name` makes them an exclusive accordion where opening one closes the others.

## What is the first rule of ARIA?

Don't use ARIA if a native HTML element or attribute already provides the semantics and behaviour you need: use `<button>`, not `<div role="button">`. ARIA only changes what assistive technology is told; it adds no behaviour. Surveys consistently find pages with more ARIA have more accessibility errors, because bad ARIA is worse than none.

## What doesn't ARIA do for you?

It adds no focusability, keyboard handling, styling or behaviour. `role="button"` on a `<div>` announces "button", but you still need `tabindex="0"`, Enter and Space handlers, and disabled and focus styling. ARIA states like `aria-expanded` must be kept in sync by your code, or they announce lies.

## When is adding a `role` or ARIA attribute actively harmful?

When it overrides correct native semantics (`<h2 role="button">` loses its heading), duplicates them (`<button role="button">`, `<nav role="navigation">`), or contradicts behaviour (a `role="menu"` without menu keyboard support). Another classic is `aria-hidden="true"` on something focusable, which leaves keyboard users on an element screen readers can't describe.

## How is an element's accessible name determined?

Roughly in priority order: `aria-labelledby` (referenced elements' text), then `aria-label`, then native labelling (an associated `<label>`, `alt`, `<legend>`, `<caption>`), then text content for roles that take their name from content, such as buttons and links, and finally `title` or `placeholder` as weak fallbacks. Check the computed result in the browser DevTools accessibility pane.

## When would you use `aria-labelledby`, `aria-label` or `aria-describedby`?

`aria-labelledby` when visible text elsewhere already names the element, such as a dialog's heading; it's preferred because it stays in sync and gets translated. `aria-label` when there's no visible text, such as an icon-only button. `aria-describedby` for supplementary information like hints or error messages, announced after the name.

## What do `tabindex="0"`, `tabindex="-1"` and positive values do?

`0` puts an element into the natural tab order at its DOM position. `-1` makes it focusable from script (`el.focus()`) but not by Tab, which is useful for headings you move focus to and inactive items in a composite widget. Positive values jump ahead of everything else and create a confusing order, so avoid them and fix the DOM order instead.

## What is roving tabindex, and when would you use it?

For composite widgets such as tabs, toolbars, menus or listboxes, the whole group is a single tab stop: the active item has `tabindex="0"`, the rest `-1`, and arrow keys move focus and the `0` between items. Tab then leaves the widget instead of walking through every item. `aria-activedescendant` is the alternative when focus must stay on a container or input.

## How should focus be handled when a modal opens and closes?

On open, move focus into the dialog, to its first sensible control or its heading. While open, keep Tab cycling inside, make the background inert, and close on Escape. On close, return focus to the element that opened it. `<dialog>` with `showModal()` handles most of this natively.

## Where should focus go after a client-side route change?

Move it to the new view's main heading (given `tabindex="-1"`) or the main content container, and update `document.title`. Otherwise focus stays on the clicked link, or falls back to `<body>`, and screen reader users get no signal that the page changed. Some teams also announce the new title via a polite live region.

## Why must you never remove focus outlines without a replacement?

Keyboard users rely on the visible focus indicator to know where they are; `outline: none` alone makes the page unusable for them and fails WCAG. Style focus with `:focus-visible`, which browsers apply for keyboard navigation but generally not for mouse clicks, and make sure the indicator has enough contrast.

## What keyboard behaviour does a custom interactive widget need?

Tab and Shift+Tab to reach and leave it, Enter and Space to activate buttons, arrow keys to move within composite widgets, Escape to dismiss popups and dialogs, and Home and End where lists are long. Follow the WAI-ARIA Authoring Practices pattern for that widget so it behaves the way screen reader users expect.

## How do live regions work, and when do you use `polite` versus `assertive`?

A container with `aria-live` (or `role="status"` or `role="alert"`) makes screen readers announce changes to its content. It must already exist in the DOM before the content changes, or the update is often missed. `polite` waits until the user is idle and suits results counts or "saved" messages; `assertive` interrupts and is for errors and urgent warnings only.

## What contrast ratios does WCAG AA require?

4.5:1 for normal text; 3:1 for large text, meaning 24 px or larger, or about 18.7 px and bold; and 3:1 for UI component boundaries, focus indicators and meaningful graphics. Separately, colour must never be the only signal: pair a red error border with an icon or message.

## Why might you avoid the `disabled` attribute on a submit button?

A disabled button can't be focused and gives no explanation, so keyboard and screen reader users may not find it or learn why it's unavailable, and its value isn't submitted. Often it's better to keep the button enabled and show validation errors on submit, or to use `aria-disabled="true"`, which stays focusable while your handler ignores activation.

## What does the `inert` attribute do?

It makes an element and its whole subtree non-interactive: it can't be focused or clicked, and it's removed from the accessibility tree. Use it on the page behind a custom modal, or on an off-canvas menu while it's hidden, instead of juggling `tabindex` on every descendant.

## How do you hide content visually but keep it available to screen readers?

Use a "visually hidden" utility class (position absolute, 1 px size, `clip-path: inset(50%)`, `overflow: hidden`). `display: none`, `visibility: hidden` and the `hidden` attribute hide content from everyone, while `aria-hidden="true"` hides it only from assistive technology. Pick based on who should perceive the content.
