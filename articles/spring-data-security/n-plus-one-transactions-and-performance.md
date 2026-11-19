---
title: N+1, Transactions and Performance
order: 3
summary: Detecting and fixing N+1, @Transactional boundaries and read-only, open-in-view, lazy initialisation exceptions, optimistic vs pessimistic locking, and HikariCP sizing.
---

Almost every JPA performance question is one of three things: too many queries (N+1), a transaction that is bigger or smaller than it should be, or a connection pool that was never sized. If you can draw the request → transaction → connection timeline on a whiteboard, you can answer all of them.

## N+1: detect it

The symptom: one query for the list, then one query per element for a lazy association.

```text
select b.* from bookmarks b where b.owner_id = ?        -- 1
select t.* from tags t join bookmark_tags ... where bookmark_id = ?   -- N times
```

Ways to see it:

```yaml
logging:
  level:
    org.hibernate.SQL: debug              # the statements
    org.hibernate.orm.jdbc.bind: trace    # bound parameters (Hibernate 6 logger name)
spring:
  jpa:
    properties:
      hibernate.generate_statistics: true # "N queries executed" summary per session
```

`spring.jpa.show-sql=true` prints to stdout without a logger; avoid it. In tests, count statements with a datasource proxy (`datasource-proxy`, `p6spy`) or Hypersistence Utils' `SQLStatementCountValidator` and assert `assertSelectCount(1)`; that turns N+1 into a failing test instead of a production incident.

## N+1: fix it

| Fix | Code | When |
|---|---|---|
| `JOIN FETCH` | `select b from Bookmark b join fetch b.tags where b.owner.id = :id` | One use case needs the association; single query |
| Entity graph | `@EntityGraph(attributePaths = {"tags", "owner"})` on the repository method | Same, but declared on a derived method |
| Batch fetching | `@BatchSize(size = 50)` on the collection, or globally `spring.jpa.properties.hibernate.default_batch_fetch_size=50` | Many places touch the association; turns N queries into N/50 `IN` queries |
| DTO projection | `select new …Summary(b.id, b.title, t.name)` | You only read; no entity, no lazy field |
| Subselect | `@Fetch(FetchMode.SUBSELECT)` | Hibernate-specific; loads the collection for all parents from the first query in one go |

Rules:

- Hibernate 6 de-duplicates parent entities in a `JOIN FETCH` result, so `distinct` is no longer needed for correctness.
- Fetch-joining two `List` collections in one query throws `MultipleBagFetchException`; use `Set`, or fetch them in two queries (the persistence context stitches the second result onto the same instances).
- `JOIN FETCH` on a collection plus `Pageable` makes Hibernate page in memory and log `HHH90003004`. Page the ids first, then fetch the collection for that page, or use batch fetching.
- The global batch size is the cheap, boring default. Set it on day one.

## @Transactional boundaries

```java
@Service
public class BookmarkService {
  @Transactional
  public BookmarkResponse create(long ownerId, CreateBookmark req) { ... }

  @Transactional(readOnly = true)
  public Page<BookmarkSummary> list(long ownerId, Pageable p) { ... }
}
```

How it works: Spring wraps the bean in a proxy; the proxy opens a transaction (gets a connection from the pool, `setAutoCommit(false)`), calls your method, and commits or rolls back on the way out. Consequences interviewers probe:

- Self-invocation does not go through the proxy: `this.create()` from another method in the same class runs with the caller's transaction, or none. Split the class or inject `self` lazily (or use `TransactionTemplate`).
- Private methods are never advised. Since Spring 6.0, protected and package-private methods can be with class-based (CGLIB) proxies, which is Boot's default, but public is the convention.
- Rollback by default only on unchecked exceptions (`RuntimeException`, `Error`). A checked exception commits unless you set `rollbackFor = Exception.class`. Catching an exception inside the method and continuing means the transaction is still marked rollback-only if a nested proxy threw, which is the `UnexpectedRollbackException` you will meet once.
- Propagation: `REQUIRED` (default) joins the caller's transaction or starts one; `REQUIRES_NEW` suspends the caller's and commits independently (audit logs, outbox rows that must survive a rollback); `MANDATORY` fails if none exists; `NOT_SUPPORTED` runs without one. `NESTED` uses a savepoint and is rarely worth it.
- Isolation defaults to the DB's (`READ COMMITTED` on Postgres). `SERIALIZABLE` is the answer only for small critical sections; retries become your problem.
- The service is the boundary. Controllers must not be transactional; repositories have their own short ones only for calls made outside a service.

`readOnly = true` tells Hibernate to skip dirty-check snapshots and set `FlushMode.MANUAL` (no accidental writes), passes `setReadOnly(true)` to the JDBC connection so a replica-aware driver can route to a reader, and documents intent. It is not a security control; a native `update` will still execute.

Keep transactions short: no HTTP calls, no message publishing, no `Thread.sleep` inside one. Each holds a pooled connection for its whole duration.

## Open Session in View: turn it off

```yaml
spring:
  jpa:
    open-in-view: false
```

With the default `true`, Boot registers an `OpenEntityManagerInViewInterceptor` that opens a persistence context at the start of the request and closes it after the response is written. It makes lazy loading "work" inside controllers and Jackson, which is exactly the problem: lazy associations fire N+1 queries during serialisation, the DB connection stays checked out while the response streams, and the real fetch problems are hidden until load testing. Boot logs a warning at startup if the property is not set explicitly. Turn it off, keep data access inside `@Transactional` services, and return DTOs.

## LazyInitializationException

"could not initialize proxy – no Session": a lazy association was touched after the persistence context closed, typically in a controller, a mapper, a `toString`, or an `@Async` method. Fixes, in order of preference:

1. Fetch what the use case needs inside the transaction (`JOIN FETCH`, entity graph).
2. Map to a DTO inside the service method before returning.
3. Widen the transaction to include the mapping (`@Transactional(readOnly = true)` on the service method that maps).

Never set `hibernate.enable_lazy_load_no_trans=true`; it opens a new session per access and is N+1 with extra steps.

## Optimistic vs pessimistic locking

```java
@Entity
public class Bookmark {
  @Version
  private long version;           // Hibernate adds "and version = ?" to every UPDATE
}
```

Optimistic: no DB lock; the `UPDATE` carries `where id = ? and version = ?`, and if zero rows are affected Hibernate throws `OptimisticLockException`, which Spring translates to `ObjectOptimisticLockingFailureException`. Handle it by returning 409 Conflict or retrying the whole use case (`@Retryable`, or a loop with `TransactionTemplate`). Right for most web traffic where conflicts are rare and the user can retry.

Pessimistic: a row lock held for the transaction.

```java
@Lock(LockModeType.PESSIMISTIC_WRITE)                  // select ... for update
@QueryHints(@QueryHint(name = "jakarta.persistence.lock.timeout", value = "3000"))
Optional<Account> findWithLockById(Long id);
```

Right for hot rows where conflicts are the norm (inventory decrement, balance transfer, a counter), where a retry storm would be worse than waiting. Keep the transaction tiny, always lock rows in the same order to avoid deadlocks, and set a timeout. `PESSIMISTIC_READ` maps to `for share`; `PESSIMISTIC_FORCE_INCREMENT` also bumps `@Version`.

Say: "Optimistic by default with `@Version`; pessimistic for the few rows that are genuinely contended."

## HikariCP sizing

Boot's default pool is HikariCP with `maximum-pool-size: 10`, `connection-timeout: 30s` (time to wait for a free connection before `SQLTransientConnectionException`), `max-lifetime: 30min`, `idle-timeout: 10min`.

```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 20                # same as max: fixed pool, no churn
      connection-timeout: 5000        # fail fast; 30 s hides problems
      max-lifetime: 1800000
      pool-name: bookmarks
```

How to reason about the number:

- Hikari's own guidance: `connections ≈ cores × 2 + spindles` for the database host, not the app host. A Postgres box with 8 cores handles roughly 20 active connections well; more means queueing inside the DB.
- Total = pool size × app instances, and it must stay under the DB's `max_connections` (Postgres default 100) with headroom for migrations and ops. Twelve pods × 20 connections already needs PgBouncer.
- Pool size bounds concurrency: with 20 connections and transactions of 10 ms, the DB tier tops out near 2,000 transactions per second per instance. Measure `hikaricp.connections.pending` and `hikaricp.connections.usage` from Actuator/Micrometer.
- Virtual threads (`spring.threads.virtual.enabled=true`) do not change this: a request still needs a real connection, and a million virtual threads waiting on a 10-connection pool just wait faster. Size the pool for the DB and let the connection timeout reject excess load.
- Leaks: `leak-detection-threshold: 20000` logs a stack trace for connections held longer than 20 s, usually a transaction wrapped around a remote call.

## Worked example: from 101 queries to 2

An endpoint lists 100 orders with their customer names and line counts:

```java
@Transactional(readOnly = true)
public List<OrderRow> recent() {
    return orders.findTop100ByOrderByCreatedAtDesc().stream()
        .map(o -> new OrderRow(o.getId(), o.getCustomer().getName(), o.getLines().size()))
        .toList();
}
```

With SQL logging on, a single request shows:

```text
select … from orders order by created_at desc limit 100     -- 1 query
select … from customer where id = ?                          -- × up to 100 (lazy customer)
select … from order_line where order_id = ?                  -- × 100 (lazy lines)
```

Up to 201 round trips. Fixes, depending on what the screen needs:

**Option 1: an entity graph** for the to-one association, and a batch size for the collection:

```java
@EntityGraph(attributePaths = "customer")
List<Order> findTop100ByOrderByCreatedAtDesc();
```

```yaml
spring.jpa.properties.hibernate.default_batch_fetch_size: 50 # lines load in batches with IN (…)
```

Result: 1 query for orders joined with customers, plus 2 batched queries for lines: 3 total.

**Option 2: a DTO projection**, since the screen only needs three values:

```java
@Query("""
    select new com.example.OrderRow(o.id, c.name, size(o.lines))
    from Order o join o.customer c
    order by o.createdAt desc
    limit 100
    """)
List<OrderRow> recentRows();
```

Result: 1 query, no entities in memory, no dirty checking. For read-only list screens this is usually the best answer.

How to catch N+1 before production: log SQL in development, count queries in tests (Hibernate statistics or a datasource proxy asserting `queryCount <= 3`), and watch query counts per request in tracing.

## Common interview questions

**What is the N+1 problem and how do you find it?**
One query loads a list, then a lazy association fires one query per row. You find it with Hibernate SQL logging and statistics, and lock it down with a statement-count assertion in an integration test.

**How do you fix N+1?**
Per use case, `JOIN FETCH` or an entity graph; across the board, `default_batch_fetch_size` so lazy loads happen in `IN` batches; and for read endpoints, a DTO projection so there is no association to load at all.

**Why does `@Transactional` not work when I call the method from the same class?**
Because the transaction is applied by a proxy around the bean, and `this.method()` bypasses the proxy. Move the method to another bean, use `TransactionTemplate`, or restructure so the public entry point is the transactional one.

**Which exceptions roll back a transaction?**
Unchecked ones by default: `RuntimeException` and `Error`. Checked exceptions commit unless `rollbackFor` says otherwise. Most Spring and JPA data exceptions are unchecked, so the default fits.

**Why turn off open-in-view?**
It keeps the persistence context and a pooled connection open until the response is written, lets lazy loading leak into serialisation, and hides N+1 behind "it works". Data access belongs in transactional services returning DTOs.

**When would you choose pessimistic locking?**
When the same row is updated concurrently as a matter of course, like stock levels or balances, and failing with a conflict would just trigger retries. `select for update` makes writers queue instead. For normal CRUD, `@Version` optimistic locking is cheaper.

**How do you size the connection pool?**
From the database's capacity, not the app's thread count: roughly two per DB core, divided among all instances, under `max_connections`. Then validate with the pending-connection metric under load and shorten the connection timeout so overload fails fast.

**What does `readOnly = true` actually change?**
Hibernate skips snapshotting entities for dirty checking and sets manual flush mode, which saves memory and time on large reads; the JDBC connection is flagged read-only so a routing driver can send it to a replica. It does not prevent a native update.

## Pitfalls

- `@Transactional` on an interface method or a private method: silently not applied.
- Catching `DataIntegrityViolationException` inside a transactional method and continuing: the transaction is already rollback-only.
- An `@Async` method called with an entity argument: it runs on another thread with no persistence context; pass ids.
- `JOIN FETCH` plus pagination: in-memory paging of the whole table.
- Pool size 100 "to be safe": more context switching at the DB and a connection storm after every deploy.

## Key takeaways

- N+1 comes from lazy associations accessed in a loop; detect it by logging and counting SQL.
- Fix with fetch joins or entity graphs for to-one, batch fetching for collections, or DTO projections for read screens.
- Keep transactions short, around the unit of work, and disable Open Session in View.
- Use optimistic locking (`@Version`) by default; pessimistic locks only for hot contended rows.
- Size the connection pool from measurements; more connections are not automatically faster.
