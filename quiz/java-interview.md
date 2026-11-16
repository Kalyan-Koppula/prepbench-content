---
title: Java Backend Interview
order: 9
module: java-interview
summary: The "how would you explain" and trade-off questions from a Java backend loop, plus the framing questions for a frontend-to-backend move.
---

## Why are you moving from frontend to backend?

The problems I find most interesting moved there: data modelling, consistency, performance under load, owning the API contract instead of consuming it. I have been at the boundary for years and want to own both sides. Keep it specific and forward-looking, never a complaint about frontend.

## How much Java do you actually know?

Enough to build and test a Spring Boot service with JPA, Flyway, JWT security and Docker, and to explain its trade-offs. I am newer to JVM tuning and large-scale concurrency than a five-year Java engineer and I say so, then point to what I built and how fast I am closing gaps.

## What is the hardest thing about Java after JavaScript?

Thinking in threads instead of an event loop: every blocking call holds a thread, pools bound concurrency, and shared mutable state needs explicit synchronisation. Second is the ORM: a persistence context is more powerful and more surprising than any client-side cache.

## Walk me through a project you built.

Lead with what it does and the stack in one sentence, then the request path through the security chain, controller, service, repository and database, then the package layout, then testing at three levels. Spend most of the time on trade-offs you chose and what you would change next.

## How would you explain Spring Boot to someone who knows Express?

Express gives you a router and you assemble everything else; Boot gives you a dependency-injected container plus starters that auto-configure the web server, JSON, validation, security and data access from what is on the classpath, with conventions you override by declaring your own bean or property.

## How would you explain the persistence context to a frontend engineer?

It is like a normalised client-side store scoped to one transaction: one instance per row, change tracking, and a flush that writes the diff at commit. The difference is that touching a lazy field after the transaction throws instead of returning stale data.

## When would you turn on virtual threads?

For I/O-bound services where requests mostly wait on the database, HTTP or queues; they remove the thread pool as the concurrency limit. They do not help CPU-bound work, the DB pool still bounds throughput, and on Java 21 `synchronized` around blocking calls pins the carrier, so use `ReentrantLock`.

## Sync or async for this endpoint?

Blocking MVC with a right-sized pool for ordinary CRUD. `CompletableFuture` with an explicit executor for fan-out to several slow dependencies inside one request. A persisted queue for work that must outlive the request, because `@Async` loses the work on a crash.

## How would you add caching to a hot read?

`@Cacheable` on the service method returning a DTO, Caffeine with a size limit and short TTL when brief staleness per instance is fine, Redis when all instances must agree, `@CacheEvict` on writes, and always a TTL. Measure the hit ratio before adding a second level.

## How do you make a POST safe to retry?

An `Idempotency-Key` header stored with the response in the same transaction as the write, so a replay returns the original result and a different payload under the same key is rejected. Where a natural key exists, a unique constraint mapped to 409 does the same with less machinery.

## Offset or keyset pagination?

Offset when users need page numbers and the table is modest; keyset on `(created_at, id)` when the list is a feed or large, because each page costs the same and inserts do not shift results. Cap the page size and never expose Spring's `Page` object as the JSON contract.

## How do you keep the database and Kafka consistent?

Transactional outbox: write the event row in the same transaction as the business change, publish from a separate poller or CDC, and make consumers idempotent with an inbox table or unique constraint. Publishing inside the transaction loses events on rollback or emits them before commit.

## When is Kafka the wrong answer?

When one service needs one consumer to do one job later: a jobs table with `select for update skip locked` is simpler, transactional with the business data, and debuggable with SQL. Kafka earns its cost with multiple consumers, replay, or high volume.

## What do you monitor on a Spring service?

Rate, errors and latency per endpoint from Micrometer's `http.server.requests`, HikariCP pending connections and usage, JVM heap and GC pauses, cache hit rates, and sampled traces for the slow tail. Alerts on readiness failures and p99 latency rather than CPU.

## Where do secrets live in a Spring Boot deployment?

In the platform's secret store, injected as environment variables or mounted files, bound to a validated `@ConfigurationProperties` record so a missing value fails startup. Never in `application.yml` in the repo and never visible through Actuator.

## How do you handle errors consistently across an API?

A `@RestControllerAdvice` extending `ResponseEntityExceptionHandler` that maps domain exceptions to RFC 9457 Problem Details with a `type`, `status`, `detail` and an `errors` array for validation. Spring's own errors use the same shape with `spring.mvc.problemdetails.enabled=true`.

## How do you stop one user reading another user's resource?

Scope the query by the caller's id taken from the token, so the repository never returns the row, and map the empty result to 404 so existence does not leak. Avoid "load then check" code paths that someone can forget.

## What happens on a concurrent update to the same row?

With `@Version`, the second `UPDATE` matches zero rows, Hibernate throws an optimistic-lock exception, the handler returns 409, and the client re-reads and retries. Without it, last write wins silently. For contended rows, `select for update` makes writers queue instead.

## How would you scale a stateless Spring service?

Add replicas behind a load balancer; the shared state is the database, so the next limits are the connection pool times instance count, then read replicas with read-only routing, a cache for hot reads, and a queue for slow side work.

## How would you test a Spring Boot service?

Unit tests with Mockito for service rules; `@WebMvcTest` with `MockMvc` and `jwt()` for status codes and validation; `@DataJpaTest` against Testcontainers Postgres for queries and migrations; a few `@SpringBootTest` end-to-end flows through the real security chain.

## Why Flyway instead of letting Hibernate manage the schema?

Migrations are reviewed SQL with a history table, and the only thing that changes production tables; Hibernate validates at startup so entity and schema drift fails the deploy. `ddl-auto=update` cannot drop, rename, backfill or be reviewed.

## Why `Integer.compare(a, b)` instead of `a - b` in a comparator?

Subtraction overflows when values are far apart and flips the sign, breaking the sort. `Integer.compare` is overflow-safe and reads as intent. The same goes for `Long.compare` and `Double.compare`.

## When do you prefer a loop over a stream in Java?

Early termination, index arithmetic, two pointers, or updating state outside the loop, since lambdas need effectively final captures. Streams suit map, filter and group pipelines where the collector names the intent; the overhead only matters in hot loops.

## What would you do in your first 90 days on a Java team?

Ship small changes through the full pipeline early, learn the codebase's transaction and error-handling conventions before adding my own, pair with whoever owns the data model, and bring testing and observability habits from frontend work where they fit.
