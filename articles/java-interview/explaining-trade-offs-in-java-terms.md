---
title: Explaining Trade-offs in Java Terms
order: 3
summary: "The design answers interviewers want from a Java backend engineer, in Java vocabulary: sync vs async, thread pools vs virtual threads, caching, idempotency, pagination, transactional consistency, observability, configuration, and where Kafka fits."
---

You already know the high-level design answers. What a Java interviewer listens for is whether you can land them: which Spring feature, which JVM mechanism, which default you would change. This article is the translation table. Each section is the answer you give in two minutes, with the specifics that make it sound like you have done it.

## Sync vs async

Default Spring MVC is synchronous: one platform thread per in-flight request, blocking on the DB or an HTTP call, from a Tomcat pool of 200. That is fine for most CRUD services; the thread count is the concurrency limit and the DB pool is usually the smaller one anyway.

Go asynchronous when a request fans out to several slow dependencies or when the work can leave the request entirely:

- `@Async` on a service method with a configured `TaskExecutor` returns immediately; combine with `CompletableFuture` for a result. Proxy-based, so same-class calls do not apply. Exceptions in void `@Async` methods vanish unless you set an `AsyncUncaughtExceptionHandler`.
- `CompletableFuture.supplyAsync(..., executor)` and `thenCombine` for parallel fan-out inside a request; always pass an executor, never rely on the common `ForkJoinPool`.
- Spring WebFlux and reactive drivers when the whole stack is non-blocking; a rewrite, not a tweak, and much less necessary since virtual threads.
- Work that must survive the request (emails, webhooks, indexing) is not "async", it is a queue: persist it, then process it from a consumer with retries.

Say: "Blocking MVC with a right-sized pool, `CompletableFuture` for fan-out inside a request, a queue for anything that must outlive it."

## Thread pool vs virtual threads

Platform threads cost about a megabyte of stack and an OS thread each, so pools are small and queueing happens in front of them. Virtual threads (Java 21) are cheap JVM-managed threads that park instead of blocking the carrier, so a service can have one per request with no pool.

```yaml
spring:
  threads:
    virtual:
      enabled: true   # Tomcat, @Async, @Scheduled, and Spring's executors use virtual threads
```

When they help: I/O-bound services with many concurrent requests waiting on DB, HTTP, or queues. Throughput scales with the downstream, not the thread count.

When they do not: CPU-bound work (still only as many cores), and anything bounded by a pool below them, which is almost always the DB connection pool. Pinning: in Java 21 a virtual thread blocking inside a `synchronized` block or a native call pins its carrier; the fix is `ReentrantLock`, and JDK 24 removed the `synchronized` pinning. Thread-locals work but a million threads each holding a cached buffer is a memory problem; prefer scoped values.

Say: "Virtual threads on, pool sizes set by the downstream capacity, `ReentrantLock` instead of `synchronized` around I/O."

## Caching

Spring's cache abstraction: `@EnableCaching`, then annotations on service methods (proxy rules apply).

```java
@Cacheable(value = "tagCounts", key = "#ownerId")
public List<TagCount> tagCounts(long ownerId) { ... }

@CacheEvict(value = "tagCounts", key = "#ownerId")
public BookmarkResponse create(long ownerId, CreateBookmarkRequest req) { ... }
```

| Store | Use | Config |
|---|---|---|
| Caffeine (in-process) | Hot, small, per-instance tolerable staleness: config, reference data, counts | `spring.cache.caffeine.spec=maximumSize=10000,expireAfterWrite=5m` |
| Redis (shared) | Many instances must agree; sessions, rate limits, computed views | `spring-boot-starter-data-redis` + `spring.cache.type=redis`, TTL via `spring.cache.redis.time-to-live` |

Points to make: cache the DTO, not the entity (entities outside a session are detached and lazy fields break); choose eviction over `@CachePut` when writes are rarer than reads; set a TTL even with eviction because something will miss; cache stampedes are handled by Caffeine's per-key loading (one loader per key) and by jittered TTLs; a shared cache needs a serialisation format you control (JSON via `GenericJackson2JsonRedisSerializer`), not Java serialisation. Multi-level (Caffeine in front of Redis) is the follow-up.

## Idempotency

Retries happen: clients time out, proxies replay, queues redeliver. `GET`, `PUT`, `DELETE` are idempotent by contract; `POST` is not, so make it so:

- `Idempotency-Key` header: store `(key, request hash, response)` in a table with a unique constraint; on a repeat, return the stored response; on a key with a different payload, 422. Expire after 24 h.
- Natural uniqueness: a unique index on `(owner_id, url)` turns a duplicate create into a `DataIntegrityViolationException` you map to 409 or to "return the existing one".
- State machine guards: `update orders set status = 'PAID' where id = ? and status = 'PENDING'` and check the row count, instead of read-then-write.
- Consumers: dedupe by message id in the same transaction as the side effect (an inbox table), because at-least-once delivery means every consumer is called twice eventually.

The connection to `@Transactional`: the idempotency record and the business write must commit together, or a crash between them yields a duplicate on retry.

## Pagination

Offset: `Pageable` with `page`/`size`, capped by `spring.data.web.pageable.max-page-size`; a `count` query if you return `Page`, none for `Slice`. Simple, random access, degrades on deep pages because the DB still walks the skipped rows, and shifts under concurrent inserts.

Keyset (cursor): `where (created_at, id) < (:cursorCreatedAt, :cursorId) order by created_at desc, id desc limit :size`, cursor encoded as an opaque base64 string. Constant cost per page, stable under inserts, no total count, no jumping to page 7. Spring Data supports it with `ScrollPosition.keyset()` and `Window<T>`.

Say: "Offset for admin tables with page numbers, keyset for feeds and anything a mobile client scrolls, and never return `PageImpl` directly from a controller."

## Consistency with @Transactional

The unit of consistency in a Spring service is the transactional method: everything in it commits or nothing does. Design answers in that vocabulary:

- One aggregate per transaction, keep it short, no remote calls inside. Anything crossing services is eventual, and the honest design says so.
- Lost updates: `@Version` optimistic locking and a 409, or `select for update` for contended rows.
- Read-your-writes across replicas: route writes and the reads that immediately follow to the primary (`readOnly` routing with a routing `DataSource`, or just one DB until it hurts).
- Dual writes (DB plus Kafka, DB plus email) are the classic consistency bug: write an outbox row in the same transaction, and a separate publisher drains it. `@TransactionalEventListener(phase = AFTER_COMMIT)` is the in-process version: react to a committed change without the side effect running inside the transaction.
- Isolation level is `READ COMMITTED` on Postgres unless you say otherwise; `REPEATABLE READ`/`SERIALIZABLE` buy you anomaly protection at the cost of retries on `SerializationFailure`.

## Observability

Actuator plus Micrometer is the answer; be specific about what you expose and what you watch.

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  endpoint:
    health:
      probes:
        enabled: true          # /actuator/health/liveness and /readiness for Kubernetes
      show-details: when-authorized
  tracing:
    sampling:
      probability: 0.1
```

- Metrics: Micrometer auto-instruments HTTP server requests (`http.server.requests` with status, uri, outcome), JVM memory and GC, HikariCP (`hikaricp.connections.pending` is the one that predicts outages), Tomcat threads, cache hit ratios. Custom: `MeterRegistry` counters and timers, or `@Timed`/`@Counted`.
- Tracing: Micrometer Tracing with an OpenTelemetry or Brave bridge; trace and span ids land in the MDC and every log line; `@Observed` or `ObservationRegistry` for custom spans.
- Logs: structured output with `logging.structured.format.console=ecs` (Boot 3.4+), correlation ids from the trace, never log tokens or PII.
- Health: readiness fails when the DB is down so the load balancer stops routing; liveness stays up so the pod is not restarted for a dependency outage.

Say: "RED metrics per endpoint from `http.server.requests`, pool saturation from Hikari, traces for the slow 1%, and health probes split into liveness and readiness."

## Configuration and secrets

- Externalised config in precedence order: command line, environment variables (relaxed binding: `APP_JWT_SECRET` → `app.jwt.secret`), `application-{profile}.yml`, `application.yml`. Profiles select environment-specific blocks; keep them few (`local`, `test`, `prod`).
- Bind config to a validated record, not scattered `@Value`:

```java
@ConfigurationProperties("app")
@Validated
public record AppProperties(@Valid Jwt jwt, @Min(1) @Max(100) int maxPageSize) {
  public record Jwt(@NotBlank @Size(min = 32) String secret, @DurationMin(minutes = 1) Duration ttl) {}
}
```

with `@EnableConfigurationProperties(AppProperties.class)` or `@ConfigurationPropertiesScan`. A missing secret fails startup with a readable message instead of a 500 on first login.

- Secrets: never in the repo; environment variables injected by the platform, or a secret manager (Vault via Spring Cloud Vault, AWS Secrets Manager, Kubernetes secrets as env or mounted files with `spring.config.import=configtree:/run/secrets/`). Rotate by restart or by a refreshable scope.
- `/actuator/env` and `/actuator/configprops` sanitise known keys but should not be exposed in production anyway.

## Where Kafka fits

One section because interviews ask "would you use Kafka here" far more often than they ask you to configure it.

Use a log like Kafka when producers and consumers should be decoupled in time and scale, when more than one consumer needs the same events, or when you need replay (rebuild a read model, backfill a new consumer). Do not use it for request/response, for a single consumer that could be a job table, or to avoid designing a transaction.

Java specifics: `spring-kafka` gives `KafkaTemplate` to publish and `@KafkaListener` with consumer groups for partition-parallel consumption; ordering holds per partition, so the key is the entity id; delivery is at-least-once by default, so consumers must be idempotent (inbox table or unique constraint); publish from an outbox table, not from inside the business transaction, or you get dual writes; retries with `DefaultErrorHandler` and a dead-letter topic; schema with JSON plus a version field or Avro with a registry. Exactly-once is a producer-transaction feature within Kafka, not end-to-end with your database.

Say: "Outbox to Kafka, keyed by aggregate id, idempotent consumers, DLT for poison messages, and a replayable topic when a second consumer shows up."

## Common interview questions

**When would you turn on virtual threads?**
For an I/O-bound service where requests spend most of their time waiting. They remove the thread pool as a limit, but the DB pool and downstream rate limits still bound throughput, and CPU-bound work gains nothing. I'd also check for `synchronized` around blocking calls on Java 21.

**How would you add caching to a hot read?**
`@Cacheable` on the service method returning a DTO, Caffeine with a size limit and a short TTL for a single instance or when brief staleness is fine, Redis when all instances must agree, and `@CacheEvict` on the writes. Measure the hit ratio before adding a second level.

**How do you make a POST safe to retry?**
An `Idempotency-Key` stored with the response in the same transaction as the write, so a replay returns the original result. Where a natural key exists, a unique constraint does the same job with less machinery.

**How do you keep the database and a message broker consistent?**
Transactional outbox: write the event row with the business change, publish from a separate poller or CDC, and make consumers idempotent. Publishing inside the transaction either loses events on rollback or emits them before commit.

**What do you monitor on a Spring service?**
Request rate, error rate and latency per endpoint from Micrometer, HikariCP pending connections and usage, JVM heap and GC pauses, cache hit rates, plus traces sampled for slow requests. Alerts on readiness failures and p99 latency, not on CPU.

**Where do secrets live?**
In the platform's secret store, injected as environment variables or mounted files, bound to a validated `@ConfigurationProperties` record so a missing value fails startup. Never in `application.yml` in the repo, and never visible through Actuator.

**Offset or cursor pagination?**
Offset when users need page numbers and tables are modest; keyset when the list is a feed or large, because each page costs the same and inserts do not shift results. Either way, cap the page size and never expose Spring's `Page` object as the JSON contract.

**When is Kafka the wrong answer?**
When one service needs one consumer to do one job later: a jobs table with `select for update skip locked` is simpler, transactional with the business data, and observable with SQL. Kafka earns its operational cost with multiple consumers, replay, or high volume.
