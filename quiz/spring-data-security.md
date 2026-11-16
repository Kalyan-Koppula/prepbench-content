---
title: Persistence and Security
order: 8
module: spring-data-security
summary: JPA and Hibernate behaviour, Spring Data repositories, N+1 and transactions, Flyway and persistence tests, Spring Security filter chain and JWT.
---

## What is the difference between JPA, Hibernate and Spring Data JPA?

JPA is the specification: annotations, `EntityManager`, JPQL. Hibernate is the implementation that turns that into SQL and manages the persistence context. Spring Data JPA sits on top and generates repository implementations from interfaces. In a Boot app you write against the first and third; the second does the work.

## What does the persistence context guarantee inside a transaction?

One managed instance per row (identity), automatic dirty checking so modified entities are written at flush without calling `save`, and deferred SQL so statements can be ordered and batched. It is a unit of work scoped to the transaction.

## What is the difference between `persist` and `merge`?

`persist` makes the given new instance managed. `merge` copies the state of a detached instance onto a managed one and returns that copy; the argument stays detached. Spring Data's `save` calls `persist` when the entity is new and `merge` otherwise, which is why saving a detached entity does a `SELECT` first.

## Why is `GenerationType.IDENTITY` bad for batch inserts?

The id comes from the database's auto-increment column, so Hibernate must execute each `INSERT` immediately to learn the id and cannot batch them. `SEQUENCE` gets ids up front in blocks, so inserts can be batched.

## What does the owning side of a JPA relationship mean?

The side that maps the foreign key column, usually the `@ManyToOne`, or the side with `@JoinTable` for many-to-many. Hibernate writes SQL only from the owning side; the `mappedBy` side is a read-only mirror. Adding to the inverse collection without setting the owning reference persists nothing.

## Why should `@ManyToOne` be `FetchType.LAZY`?

Its JPA default is eager, so every load of the entity also loads the parent, in every query, forever. Lazy keeps base queries cheap and lets each use case fetch what it needs with `JOIN FETCH` or an entity graph.

## How should an entity implement `equals` and `hashCode`?

Either on a stable business key, or on the id with a constant `hashCode`, because the id is null until flush and a changing hash breaks `HashSet` membership. Use `instanceof` (Hibernate proxies are subclasses) and getters so proxies initialise. Never generate them over all fields.

## Why not return JPA entities from a controller?

Jackson walks lazy associations outside the transaction, causing `LazyInitializationException` or hidden N+1 queries, and the database schema leaks into the API. Return records or projections mapped inside the service.

## How does Spring Data turn an interface into a working repository?

At startup it scans for repository interfaces, creates a proxy backed by `SimpleJpaRepository`, and parses each method name into JPQL or uses the `@Query`. Invalid method names fail the application context, not the first request.

## When do you write `@Query` instead of a derived method name?

When the name needs more than two conditions, a join, a projection, or something the parser cannot express. The method name is the API; if it is not readable at a glance, a JPQL string is clearer.

## What is the difference between `Page` and `Slice`?

`Page` runs an extra `count` query to report totals and page count. `Slice` fetches one row more than the page size and only knows whether there is a next page. Use `Slice` for infinite scroll, `Page` when the UI shows page numbers.

## Why do bulk `@Modifying` updates leave stale entities in memory?

JPQL bulk statements go straight to the database and bypass the persistence context. Entities already loaded keep their old values. `clearAutomatically = true` or `entityManager.clear()` detaches them so the next read hits the database.

## What is the N+1 problem and how do you detect it?

One query loads a list and then a lazy association fires one query per row. Detect it with `org.hibernate.SQL` logging and `generate_statistics`, and prevent regressions with a statement-count assertion in an integration test.

## Name three ways to fix N+1.

`JOIN FETCH` or an `@EntityGraph` for the use case that needs the association; `hibernate.default_batch_fetch_size` so lazy loads happen in `IN` batches everywhere; and DTO projections for read endpoints so no association is loaded at all.

## Why does `@Transactional` not apply when called from another method in the same class?

Transactions are applied by a proxy around the bean; `this.method()` calls the target directly and bypasses the proxy. Move the method to another bean, use `TransactionTemplate`, or make the public entry point the transactional one.

## Which exceptions roll back a Spring transaction by default?

Unchecked ones: `RuntimeException` and `Error`. A checked exception commits unless you set `rollbackFor`. Once a nested transactional call has thrown, the transaction is rollback-only even if you catch the exception, which produces `UnexpectedRollbackException` at commit.

## What does `@Transactional(readOnly = true)` change?

Hibernate skips dirty-check snapshots and sets manual flush mode, saving memory and time on large reads, and the JDBC connection is flagged read-only so a routing driver can send it to a replica. It does not block a native `UPDATE`.

## Why turn off `spring.jpa.open-in-view`?

With it on, the persistence context and a pooled connection stay open until the response is written, lazy loading leaks into serialisation and hides N+1, and the pool is held for longer than the transaction. Keep data access inside transactional services and return DTOs.

## What causes `LazyInitializationException` and how do you fix it?

A lazy association was touched after the session closed, typically in a controller, mapper or `toString`. Fetch what the use case needs inside the transaction (`JOIN FETCH`, entity graph) or map to a DTO before returning; never enable `enable_lazy_load_no_trans`.

## Optimistic or pessimistic locking: how do you choose?

Optimistic with `@Version` by default: no DB lock, a conflicting update fails and the client retries, right when conflicts are rare. Pessimistic (`select for update` via `@Lock(PESSIMISTIC_WRITE)`) for hot rows like balances or stock where conflicts are normal and queueing beats retry storms.

## How do you size the HikariCP pool?

From the database's capacity, not the app's threads: roughly two connections per DB core, divided across all app instances, staying under `max_connections`. Then verify with `hikaricp.connections.pending` under load and shorten `connection-timeout` so overload fails fast.

## How are Flyway migrations named and what happens if you edit one that already ran?

`V<version>__<description>.sql` with two underscores; versioned scripts run once in order, `R__` repeatable scripts rerun when their checksum changes. Editing an applied script changes its checksum and Flyway fails validation on the next start; the fix is a new migration.

## Why must `ddl-auto=update` never reach production?

It only adds, never drops, renames or narrows, so the schema drifts; it cannot express data migrations or online-safe changes; it runs unreviewed at startup on whichever instance boots first; and its output depends on the Hibernate version. Flyway owns the schema and Hibernate runs in `validate`.

## H2 or Testcontainers for repository tests?

Testcontainers: tests against a different database do not test the SQL you ship, and Postgres-specific migrations will not even run on H2. The cost is Docker and a few seconds of startup, amortised with container reuse and `@ServiceConnection`.

## What does `@DataJpaTest` configure?

Only the JPA layer: entities, repositories, `TestEntityManager`, Flyway or DDL. Each test runs in a transaction that rolls back. By default it replaces the datasource with an embedded database, so with Testcontainers you add `@AutoConfigureTestDatabase(replace = NONE)`.

## Why can a repository test pass while the query is wrong?

Inside one transaction the first-level cache returns the entities you just persisted without querying. Call `flush()` and `clear()` after arranging data so the method under test issues real SQL.

## How do you test that a service rolls back on failure?

Without a test-level `@Transactional`, trigger a failure after the first write, assert the exception, then assert through a repository that nothing was persisted. For `REQUIRES_NEW` paths, assert the side effect that should have survived the rollback.

## Walk me through what happens to a request in Spring Security.

`FilterChainProxy` picks the matching `SecurityFilterChain` and runs its filters: security context loading, CORS, CSRF, an authentication filter that puts an `Authentication` into `SecurityContextHolder`, exception translation, then `AuthorizationFilter` applies the `authorizeHttpRequests` rules. Only then does the request reach the controller.

## Authentication versus authorization, in Spring terms?

Authentication produces an `Authentication` object through an `AuthenticationManager` and its providers (`DaoAuthenticationProvider`, `JwtAuthenticationProvider`). Authorization checks that object against URL rules and `@PreAuthorize` with `AuthorizationManager`s. The first failing gives 401, the second 403.

## What does `UserDetailsService` do and what does it not do?

It loads a `UserDetails` (username, hashed password, authorities, account flags) by username. It does not check the password; `DaoAuthenticationProvider` does that with the `PasswordEncoder`. `UsernameNotFoundException` is hidden behind `BadCredentialsException` so usernames do not leak.

## How are passwords stored and verified?

Hashed with BCrypt through a `DelegatingPasswordEncoder`, which prefixes the hash with `{bcrypt}` so the algorithm can be upgraded later. Registration calls `encode`; login calls `matches(raw, hash)`. Nothing is ever decrypted.

## How would you secure a stateless REST API with JWTs?

`spring-boot-starter-oauth2-resource-server` with a `JwtDecoder` (issuer URI or a local key), `SessionCreationPolicy.STATELESS`, CSRF disabled, CORS for the frontend origin, a converter mapping a roles claim to authorities, short-lived access tokens with a revocable refresh token, and `@PreAuthorize` for ownership checks.

## When is disabling CSRF correct?

When the browser cannot attach credentials automatically: a bearer token in the `Authorization` header and no session cookie. If the token or session lives in a cookie, keep CSRF on or rely on `SameSite` plus origin checks.

## What is wrong with `hasRole("ROLE_ADMIN")`?

`hasRole` adds the `ROLE_` prefix itself, so it looks for `ROLE_ROLE_ADMIN` and nobody matches. Write `hasRole("ADMIN")` or `hasAuthority("ROLE_ADMIN")`.

## Why does a CORS preflight fail with 401 on a secured API?

The `OPTIONS` request has no credentials and hits the security chain before your controller. Register a `CorsConfigurationSource` bean and enable `.cors()` so the `CorsFilter`, which runs before authentication, answers the preflight.
