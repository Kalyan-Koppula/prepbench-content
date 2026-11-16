---
title: E-commerce Product Page
order: 5
summary: Design a product detail page — SSR and SEO, variant selection state, cart interactions, inventory and price freshness, performance budgets and analytics.
---

The product detail page (PDP) is where revenue happens, so interviewers care about the business-critical trade-offs: it must be indexable, fast on mid-range phones, correct about price and stock, and instrumented. It's a good prompt for showing rendering-strategy judgement (what is static, what is dynamic, what is personalised).

## Requirements

### Clarifying questions

- How many products and how often do they change? Is price/stock per region or per user?
- Variants: size, colour, material? Do variants have their own images, prices and stock?
- Personalisation: recommendations, recently viewed, logged-in pricing?
- Cart: drawer, separate page, or both? Guest carts?
- Markets and locales: currencies, languages, tax display rules?
- Traffic profile: flash sales, spikes? SEO priority?

### Functional

- Show title, gallery, price, description, specs, reviews summary, recommendations.
- Select variants (colour, size) with unavailable combinations disabled.
- Add to cart with quantity; show cart count and a confirmation (mini-cart).
- Show stock status ("Only 3 left", "Out of stock", "Back in stock soon").
- Shareable URLs for a specific variant.

### Non-functional

- SEO: fully rendered HTML, structured data, canonical URLs.
- Performance: LCP < 2.5 s and INP < 200 ms at p75 on mobile; tight JS budget.
- Correctness: price and stock never misleadingly stale at checkout.
- Resilient to traffic spikes (cacheable at the CDN).
- Accessible, localised, measurable (analytics and experiments).

## Architecture

```text
                    CDN / edge (cached HTML shell, images)
                                 |
+--------------------------------v-------------------------------------+
| ProductPage (server-rendered)                                        |
|                                                                      |
|  Breadcrumbs   ProductGallery            ProductInfo                 |
|  (static)      (first image eager)       title, rating summary       |
|                                          PriceBlock*  (dynamic)      |
|                                          VariantSelector  (client)   |
|                                          StockStatus*  (dynamic)     |
|                                          AddToCart  (client)         |
|  Description / Specs (static)                                        |
|  <Suspense> Reviews (streamed)   <Suspense> Recommendations (lazy)   |
+--------------------+----------------------------+--------------------+
                     |                            |
          Product API (catalog)          Cart API / Inventory API
          cacheable, revalidated         per-request, uncached
                                                  |
                                     Analytics queue (sendBeacon)

* streamed or fetched on the client so the cached shell stays static
```

Rendering strategy:

| Part | Strategy | Why |
|---|---|---|
| Title, description, images, specs | SSG/ISR or cached SSR with revalidation on catalogue change | Same for everyone; SEO critical |
| Price | SSR with short TTL, or streamed per region | Changes with promotions; must match checkout |
| Stock | Fetched fresh (streamed or client) | Changes constantly; caching it is misleading |
| Cart count, personalised recs | Client or streamed per user | Personal; must not be cached in shared CDN HTML |
| Reviews | Streamed below the fold | Slow query; not needed for first paint |

With Server Components and streaming, the static shell is served instantly from the edge and dynamic holes (price, stock, recs) stream in (partial prerendering). Without them: cached SSR page + client fetches for dynamic bits.

## Data model

```ts
type Product = {
  id: string
  slug: string
  title: string
  description: string
  images: Array<{ id: string; url: string; width: number; height: number; alt: string; variantIds?: string[] }>
  options: Array<{ name: 'colour' | 'size'; values: string[] }>
  variants: Variant[]
  rating: { average: number; count: number }
}

type Variant = {
  id: string
  sku: string
  options: Record<string, string>   // { colour: 'blue', size: '42' }
  price: { amount: number; currency: string }   // minor units, e.g. 12999
  compareAtPrice?: { amount: number; currency: string }
}

type Inventory = Record<string, { available: number; status: 'in_stock' | 'low' | 'out' | 'preorder' }>

type CartState = {
  id: string
  lines: Array<{ lineId: string; variantId: string; quantity: number; unitPrice: number }>
  count: number
  status: 'idle' | 'mutating' | 'error'
}

type PdpUiState = {
  selected: Record<string, string>  // derived from URL ?colour=blue&size=42
  quantity: number
}
```

Store money in **minor units** (integers) and format with `Intl.NumberFormat`; never do float arithmetic on prices.

## Interface

```text
GET  /api/products/:slug                    -> Product          (Cache-Control: s-maxage=300, stale-while-revalidate)
GET  /api/inventory?variantIds=a,b,c        -> Inventory        (no-store or max-age=5)
GET  /api/prices?variantIds=a,b&region=GB   -> prices           (short TTL)
GET  /api/products/:id/reviews?cursor=...   -> paginated reviews
GET  /api/products/:id/recommendations      -> personalised list
POST /api/cart/lines  { variantId, quantity, idempotencyKey } -> Cart
PATCH /api/cart/lines/:lineId { quantity } -> Cart
```

- Cart mutations return the **full updated cart** (server computes totals, discounts, tax).
- Idempotency key on add-to-cart so double clicks or retries don't add twice.
- No persistent real-time channel needed. For hot items, poll stock on focus/visibility or after an interval; push via SSE only for flash sales or live countdowns.

## Variants state

Selected variant lives in the **URL** (`/p/runner-x?colour=blue&size=42`): shareable, back button works, SEO can canonicalise.

```ts
function findVariant(p: Product, selected: Record<string, string>) {
  return p.variants.find((v) => Object.entries(selected).every(([k, val]) => v.options[k] === val))
}

function isValueAvailable(p: Product, inv: Inventory, selected: Record<string, string>, option: string, value: string) {
  const candidate = { ...selected, [option]: value }
  return p.variants.some((v) =>
    Object.entries(candidate).every(([k, val]) => v.options[k] === val) && inv[v.id]?.status !== 'out')
}
```

- Disable (but keep focusable with `aria-disabled` and an explanation) unavailable combinations, or show them crossed out.
- Changing colour swaps the gallery to that colour's images; preload them on hover.
- Update the URL with `replaceState` (variant changes shouldn't flood history), and keep `rel="canonical"` pointing to the base product.

## Cart

- Add to cart: optimistic count increment and mini-cart open, disabled button with pending label, reconcile with server cart; roll back with an error message if it fails (e.g. "Only 2 left").
- Cart is shared state across the app (header badge, mini-cart, cart page): server-state cache keyed `['cart']`, invalidated or replaced after mutations.
- Guest carts: cart id in a cookie; merge on login.
- Multiple tabs: refetch the cart on `visibilitychange`, or broadcast with `BroadcastChannel`.

## Inventory and price freshness

- Never trust the cached PDP for stock; fetch live inventory for the selected product's variants.
- Price shown on PDP may be cached briefly but **checkout re-validates** price and stock server-side; show clear messages if they changed.
- Low stock signals must be truthful (legal and trust issues).
- Flash sales: shorter TTLs, queueing, and a waiting room are backend concerns; the client must handle 409/410 gracefully.

## Optimisations

### Performance budget

| Budget | Target |
|---|---|
| LCP (p75 mobile) | < 2.5 s |
| INP (p75) | < 200 ms |
| CLS | < 0.1 |
| JS on initial load | e.g. < 150 KB compressed |
| Hero image | < ~150 KB, AVIF/WebP, responsive |
| Third-party scripts | Audited, deferred, each with an owner |

Techniques: hero image preloaded with `fetchpriority="high"`; lazy load lower gallery images, reviews and recommendations; code-split zoom viewer, size guide modal, reviews widget; Server Components for static sections; Speculation Rules or link prefetch for likely next pages (cart, related products).

### SEO

- Server-rendered HTML with title, description, Open Graph tags.
- `schema.org/Product` JSON-LD with `offers` (price, currency, availability) and `aggregateRating`.
- Canonical URL, clean slugs, `hreflang` for locales, crawlable links to related products.

```html
<script type="application/ld+json">
{ "@context": "https://schema.org", "@type": "Product", "name": "Runner X",
  "offers": { "@type": "Offer", "price": "129.99", "priceCurrency": "GBP",
              "availability": "https://schema.org/InStock" } }
</script>
```

### Analytics

- Events: `product_viewed`, `variant_selected`, `add_to_cart`, `image_viewed`, `reviews_opened`, with product and variant ids.
- Send with `navigator.sendBeacon` or `fetch(..., { keepalive: true })` from a queue, batched, on `visibilitychange`.
- Don't block interactions on analytics; load vendor scripts after the page is interactive or route them server-side.
- A/B tests: decide variant on the server/edge to avoid flicker; respect consent (CMP) before tracking.

### Accessibility

- Variant options as radio groups (`<fieldset>` + `<legend>`) rather than custom divs; swatches need text names, not just colours.
- Price and stock changes announced via a polite live region when the variant changes.
- Add-to-cart confirmation announced; mini-cart as a dialog with focus management.
- Gallery follows carousel a11y; zoom is optional, not the only way to see details.

### i18n and security

- `Intl.NumberFormat` for currency, locale-specific tax-inclusive display, translated variant names, RTL layout.
- Sanitise user reviews; CSRF protection on cart mutations; don't put personal data in cached HTML.

## Deep-dive questions

**How do you get both SEO and fresh stock?**
Serve cacheable server-rendered HTML for product content and fetch or stream price and stock separately per request, then validate again at checkout.

**Where does selected-variant state live?**
In the URL query string, so it is shareable and survives reload; derive the variant from it during render, and use `replaceState` to avoid polluting history.

**What happens on double-click of Add to cart?**
The button is disabled while pending and the request carries an idempotency key, so the server adds one line.

**How do you keep the cart badge consistent across the app and tabs?**
One server-state cache entry for the cart, updated from mutation responses, and refetched on tab visibility or broadcast between tabs.

**How would you enforce a performance budget?**
Bundle size checks and Lighthouse CI in pull requests, RUM dashboards on LCP/INP by template, and an approval process for new third-party scripts.

**Why integers for money?**
Floating-point can't represent many decimal amounts exactly; integer minor units avoid rounding errors in totals.
