---
title: Pagination, Filtering and Versioning
order: 4
summary: Pageable and Sort, offset vs cursor pagination, filtering patterns, API versioning options with trade-offs, HATEOAS in a sentence, and idempotency keys.
---

These are the "design a list endpoint" and "how would you evolve this API" questions. You know the HTTP-level answers; this is how Spring Data and Spring MVC implement them, plus the trade-offs interviewers expect you to volunteer.

## `Pageable`, `Page` and `Sort`

Spring Data binds `?page=0&size=20&sort=createdAt,desc&sort=id,asc` onto a `Pageable` parameter automatically (`spring-boot-starter-data-jpa` or `-data-mongodb` plus the web starter):

```java
@GetMapping
public Page<OrderSummary> list(@PageableDefault(size = 20, sort = "createdAt", direction = DESC) Pageable pageable) {
    return orders.findByStatus(Status.PAID, pageable).map(OrderSummary::from);
}

// repository
Page<Order> findByStatus(Status status, Pageable pageable);     // runs the query + a COUNT query
Slice<Order> findByCustomerId(long id, Pageable pageable);      // no count; fetches size+1 to know hasNext
```

```yaml
spring:
  data:
    web:
      pageable:
        default-page-size: 20
        max-page-size: 200            # default 2000; clamp it
        one-indexed-parameters: false
        serialization-mode: via_dto  # Boot 3.4+: stable JSON for Page (PagedModel) instead of PageImpl internals
```

- `Page` runs a second `count(*)` query; on large tables that's as expensive as the page itself. Use `Slice` or a cursor when you only need "is there more".
- `Sort` properties are entity field names; validate or whitelist them, because a client can sort by any mapped column (performance, and leaking column names).
- Serialising `Page<T>` directly used to emit Spring internals; set `serialization-mode: via_dto` (Spring Data 3.3; the Boot property arrived in 3.4) or map to your own envelope `{ "items": [...], "page": 0, "size": 20, "totalElements": 1234 }`.

## Offset vs cursor (keyset)

| | Offset (`page`/`size`) | Cursor / keyset |
|---|---|---|
| SQL | `ORDER BY created_at DESC, id DESC LIMIT 20 OFFSET 4000` | `WHERE (created_at, id) < (:lastTs, :lastId) ORDER BY created_at DESC, id DESC LIMIT 20` |
| Deep pages | DB scans and discards 4000 rows | constant: index seek to the last key |
| Inserts between requests | rows shift; duplicates or gaps | stable |
| Jump to page N / total count | yes | no (you can still return a separate approximate count) |
| Client contract | `?page=200&size=20` | opaque `?after=eyJ0cyI6…` (base64 of the sort key tuple) |
| Use | admin tables, small datasets | feeds, timelines, infinite scroll, export jobs |

Spring Data 3.1+ supports keyset directly: `Window<Order> findByStatus(Status s, ScrollPosition pos, Limit limit)` with `ScrollPosition.keyset()` (the `Limit` parameter type arrived in 3.2; before that use `findFirst20By…`); `window.positionAt(window.size() - 1)` gives the next position. The sort must be **total** (include a unique tiebreaker like `id`) or cursors skip rows. Return `nextCursor: null` to signal the end; never expose raw ids as the cursor if you don't want clients forging them (sign or encrypt the token).

## Filtering

Options from simple to heavy:

1. **Explicit params → repository methods**: `?status=PAID&customerId=7` bound to a filter record, with derived query methods or a `@Query`. Clear, typed, documented. Combinatorial explosion past three or four filters.
2. **`Specification<T>`** (JPA Criteria): compose predicates for whatever subset was supplied:

```java
public record OrderFilter(Status status, Long customerId, LocalDate from, LocalDate to) {
    Specification<Order> toSpec() {
        return Specification.allOf(
            status == null ? null : (r, q, cb) -> cb.equal(r.get("status"), status),
            customerId == null ? null : (r, q, cb) -> cb.equal(r.get("customer").get("id"), customerId),
            from == null ? null : (r, q, cb) -> cb.greaterThanOrEqualTo(r.get("createdAt"), from.atStartOfDay()));
    }
}
// repository extends JpaSpecificationExecutor<Order>; orders.findAll(filter.toSpec(), pageable)
```

3. **Querydsl** or **`Example`/`QueryByExampleExecutor`** for type-safe or by-example matching.
4. **A query language** (`?filter=status eq 'PAID' and total gt 100`, RSQL, OData, GraphQL) when clients need arbitrary expressions; you then own parsing, whitelisting fields and protecting the database.

Rules: whitelist filterable and sortable fields; index what you filter on; never build JPQL by string concatenation; return 400 for unknown filter keys rather than silently ignoring them (or document that you ignore them).

Field selection (`?fields=id,name`) and expansion (`?expand=customer`) are sparse-fieldset patterns; implement with `@JsonView`, Jackson filters or separate DTOs, or say "that's where GraphQL earns its complexity".

## API versioning

| Strategy | Example | Pros | Cons |
|---|---|---|---|
| URI path | `/v1/orders` | obvious, cacheable, easy routing and docs | the same resource gets two identities; "v2" tends to fork the whole API |
| Query param | `/orders?version=2` | easy to test in a browser | easily omitted, caches must vary on it |
| Custom header | `X-API-Version: 2` | URI stays clean | invisible in logs/browser, harder for clients |
| Media type | `Accept: application/vnd.acme.v2+json` | the "REST-correct" one, versions the representation | awkward for clients and tooling |
| No version, additive only | expand/contract fields, never remove | least work, what most internal APIs do | needs discipline; breaking changes still need a plan |

Spring implementation in Boot 3.5: path versioning is just two `@RequestMapping` prefixes (or two controllers); header/media type use `headers = "X-API-Version=2"` or `produces = "application/vnd.acme.v2+json"` on the mapping. Spring Framework 7 / Boot 4 adds first-class versioning: configure a resolver (`spring.mvc.apiversion.use.header=X-API-Version`, or path segment / query param / media-type param) and declare `@GetMapping(path = "/orders", version = "2")`, with a default version, deprecation signalling and validation of unsupported versions out of the box.

The answer interviewers want: be additive by default (new optional fields, new endpoints), version only for incompatible changes, keep at most two versions live with a sunset date (`Deprecation`/`Sunset` headers), and version the representation not the data. For internal service-to-service APIs, consumer-driven contract tests often make versions unnecessary.

## HATEOAS in a sentence

Hypermedia responses carry links to the next legal actions (`"_links": { "cancel": { "href": "/orders/7/cancel" } }`) so clients navigate by relation rather than hard-coding URIs; Spring HATEOAS provides `EntityModel`, `PagedModel` and `linkTo(methodOn(...))` to build them, and most teams use it only for pagination links, if at all.

## Idempotency keys

`POST` isn't idempotent, but clients retry on timeouts. The standard fix: the client sends `Idempotency-Key: <uuid>`; the server stores the key with the request fingerprint and, once done, the response; a repeat with the same key returns the stored response instead of creating a second order.

```java
@PostMapping("/orders")
public ResponseEntity<OrderResponse> create(@RequestHeader("Idempotency-Key") UUID key,
                                            @Valid @RequestBody CreateOrderRequest req) {
    return idempotency.execute(key, req, () -> {
        Order o = orders.place(req);
        return ResponseEntity.created(locationOf(o)).body(OrderResponse.from(o));
    });
}
```

Implementation points: store keys with a TTL (24 h is typical) in the DB or Redis; insert the key **before** doing the work inside the same transaction as the write so concurrent duplicates hit a unique constraint — one proceeds, the other returns 409 (in progress) or waits; compare the request fingerprint and return 422 if the same key arrives with a different body; scope keys per client/tenant. `PUT` and `DELETE` are idempotent by design and don't need it; `PATCH` depends on the semantics.

## Worked example: keyset pagination

Offset pagination (`LIMIT 20 OFFSET 100000`) makes the database read and discard 100,000 rows, and rows inserted between page loads shift results. Keyset ("seek") pagination continues from the last row seen instead:

```java
public interface EventRepository extends JpaRepository<Event, Long> {
    // first page
    List<Event> findTop20ByOrderByCreatedAtDescIdDesc();

    // next pages: strictly "after" the last (createdAt, id) seen, in the same order
    @Query("""
        select e from Event e
        where e.createdAt < :createdAt
           or (e.createdAt = :createdAt and e.id < :id)
        order by e.createdAt desc, e.id desc
        """)
    List<Event> findNextPage(Instant createdAt, long id, Limit limit);
}

record EventPage(List<EventDto> items, String nextCursor) {}

EventPage page(String cursor) {
    List<Event> rows = (cursor == null)
        ? events.findTop20ByOrderByCreatedAtDescIdDesc()
        : decode(cursor, (createdAt, id) -> events.findNextPage(createdAt, id, Limit.of(20)));
    String next = rows.size() < 20 ? null : encode(rows.get(rows.size() - 1)); // base64 of "createdAt|id"
    return new EventPage(rows.stream().map(EventDto::from).toList(), next);
}
```

Key details:

- The sort includes a **unique tiebreaker** (`id`), so rows with equal timestamps are neither skipped nor repeated.
- An index on `(created_at DESC, id DESC)` makes each page an index range scan, equally fast on page 1 and page 10,000.
- The cursor is **opaque** to clients (base64-encoded), so you can change its contents later.
- You lose "jump to page 37" and total counts; that's the trade-off. Use offset pagination for small admin tables and keyset for feeds and large lists.

Spring Data also offers `ScrollPosition` and `Window<T>` (`findFirst20ByOrderByCreatedAtDesc(ScrollPosition position)`) that implement keyset scrolling for you.

## Common interview questions

**How do you paginate a list endpoint in Spring?**
Take a `Pageable` parameter (page, size, sort bound from the query string), pass it to the repository, and return a DTO envelope with items and paging metadata. Cap `size`, whitelist sort fields, and prefer `Slice` or keyset when the count query is expensive.

**When would you choose cursor pagination over page numbers?**
When the dataset is large or changes while being read: feeds, event logs, exports. Keyset queries are constant-time at any depth and don't duplicate or skip rows on insert. The cost is no random page access and an opaque cursor tied to a total ordering.

**How would you implement flexible filtering without exploding repository methods?**
A filter DTO bound from query params, converted into a JPA `Specification` (or Querydsl predicate) that adds a predicate only for supplied fields. Whitelist fields, index them, and reject unknown parameters.

**Which API versioning strategy would you pick?**
Default to additive, backward-compatible changes with no version. When a break is unavoidable, URI versioning for public APIs because it's explicit and cache-friendly; header or media-type versioning when URLs must stay stable. Keep two versions max, with sunset headers.

**What's wrong with returning `Page<T>` straight from Spring Data?**
Its JSON was tied to `PageImpl` internals and Spring warns about it; a DTO envelope (or `serialization-mode: via_dto`) gives a stable contract. Also it leaks a count query on every request even when the client doesn't show totals.

**How do you make a `POST` safe to retry?**
An `Idempotency-Key` header stored with the response; duplicates return the cached result. Insert the key atomically with the write so concurrent retries are serialised by a unique constraint, expire keys after a day, and reject reuse with a different payload.

**What is HATEOAS and do you use it?**
Including links to related actions and resources in responses so clients follow relations rather than build URLs. Useful for pagination links and workflow state; full hypermedia clients are rare, so most teams stop at `next`/`prev` links.

## Pitfalls

- No `max-page-size`: `?size=1000000` is a denial-of-service with one request.
- Sorting by a non-indexed column on a large table because the client asked.
- Keyset cursor on a non-unique sort key: rows with equal timestamps get skipped.
- Idempotency check outside the transaction: two concurrent retries both pass the "not seen" check.
- `/v2` that copies every controller: now every bug fix is applied twice.

## Key takeaways

- Paginate every collection endpoint; offer stable sorting with a unique tiebreaker.
- Offset pagination is simple but slow for deep pages and unstable under inserts; keyset pagination fixes both.
- Validate and whitelist filter and sort fields; use Specifications or Querydsl for dynamic filters.
- Version APIs explicitly (URL path or header) and evolve additively where possible.
- Use idempotency keys for retried non-idempotent requests like payments.
