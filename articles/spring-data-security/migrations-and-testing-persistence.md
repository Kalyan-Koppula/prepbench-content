---
title: Migrations and Testing Persistence
order: 4
summary: Flyway naming and workflow, why ddl-auto=update never reaches prod, H2 versus Testcontainers, @DataJpaTest, seeding data, and testing transactional behaviour.
---

Schema changes and persistence tests are where "it works on my machine" lives. Interviewers ask about migrations to see whether you have shipped a schema change to a running system, and about tests to see whether your repository tests would catch a Postgres-only query breaking. Frontend parallel: Flyway is to the database what a versioned, append-only changelog of codemods would be to your app.

## Flyway: naming and workflow

Add `org.flywaydb:flyway-core` plus the database module (`org.flywaydb:flyway-database-postgresql` since Flyway 10; Boot's dependency management covers the version). Boot runs pending migrations at startup before JPA validates the schema.

```text
src/main/resources/db/migration/
  V1__create_users.sql
  V2__create_bookmarks.sql
  V2_1__add_bookmarks_owner_index.sql
  V3__bookmark_visibility.sql
  R__refresh_tag_counts_view.sql
```

- `V<version>__<description>.sql`: two underscores, version segments separated by `_` or `.`. Versions are ordered numerically, so `V10` runs after `V9`. Repeatable `R__` scripts run whenever their checksum changes, after all versioned ones; use them for views and functions.
- Flyway records each applied script in `flyway_schema_history` with a checksum. Editing an applied file fails validation on the next start (`Migration checksum mismatch`). The fix is a new migration, never an edit; `flyway repair` is for correcting the history table after a hotfix, not routine.
- Out-of-order versions (a `V2_5` merged after `V3` ran) are rejected unless `spring.flyway.out-of-order=true`. On a team, agree on timestamps (`V20250412_1030__…`) to avoid collisions, or rebase migration numbers before merge.
- Every migration should be safe to run on a live system: add a nullable column, backfill in batches, add the constraint, then drop the old column in a later release (expand/contract). `ALTER TABLE … ADD COLUMN … NOT NULL DEFAULT …` is cheap on modern Postgres; rewriting a big table is not.
- Each migration runs in a transaction on Postgres; DDL that cannot (`CREATE INDEX CONCURRENTLY`) needs its own file plus a script configuration sidecar (`V7__idx.sql.conf` containing `executeInTransaction=false`, available in the Community edition) or a separate config.

```yaml
spring:
  flyway:
    locations: classpath:db/migration
    baseline-on-migrate: true     # adopting an existing database: mark the current state as V1
  jpa:
    hibernate:
      ddl-auto: validate          # fail fast if entities and schema disagree
```

Liquibase is the alternative (XML/YAML changelogs, rollback support, database-agnostic types). Flyway is plain SQL and simpler; say you would choose either but know Flyway.

## Never ddl-auto=update in production

`spring.jpa.hibernate.ddl-auto` values: `none`, `validate`, `update`, `create`, `create-drop`. Boot defaults to `create-drop` for embedded databases and `none` otherwise.

Why `update` is a production hazard:

- It adds columns and tables but never drops, renames, or narrows anything, so the schema drifts from the entities and nobody knows what is really there.
- It cannot express data migrations, indexes beyond `@Index`, constraints with names, or batched backfills.
- Changes happen at app startup, on whichever instance boots first, with no review, no history table, and no way to roll back.
- The generated DDL depends on the dialect and the Hibernate version; an upgrade can change what it emits.

The professional setup: Flyway owns the schema, Hibernate `validate`s it at startup, and the only thing that can change production tables is a reviewed SQL file.

## H2 versus Testcontainers

| | H2 in-memory | Testcontainers Postgres |
|---|---|---|
| Startup | milliseconds | 2–5 s for the first container, reusable afterwards |
| Fidelity | different SQL dialect; `MODE=PostgreSQL` helps but `jsonb`, `on conflict`, full-text, sequences, locking semantics still differ | the real database and version you deploy |
| Flyway scripts | Postgres-specific DDL often fails | run unchanged |
| Needs | nothing | Docker on the dev machine and in CI |

If your migrations are Postgres SQL, H2 cannot even run them, so you end up maintaining a second schema path for tests, which is the thing you were trying to test. Use Testcontainers for anything touching SQL; keep H2, if at all, for pure JPQL unit tests you want to run in a second.

```java
@SpringBootTest
@Testcontainers
class BookmarkRepositoryIT {

  @Container
  @ServiceConnection                       // Boot 3.1+: wires url/username/password automatically
  static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");
}
```

Before `@ServiceConnection` you wrote `@DynamicPropertySource` to set `spring.datasource.url` from `postgres.getJdbcUrl()`. A `static` container is shared by all tests in the class; put it in an abstract base class or a `@TestConfiguration(proxyBeanMethods = false)` with `@Bean @ServiceConnection` to share across classes. Enable reuse (`.withReuse(true)` plus `testcontainers.reuse.enable=true` in `~/.testcontainers.properties`) to keep the container alive between local runs. Boot 3.1 also added `spring-boot-testcontainers` with a `TestBookmarksApplication` pattern for running the app locally against containers (`./mvnw spring-boot:test-run`).

## @DataJpaTest

```java
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)   // keep the real datasource
@Testcontainers
class BookmarkRepositoryTest {

  @Container @ServiceConnection
  static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

  @Autowired BookmarkRepository bookmarks;
  @Autowired TestEntityManager em;

  @Test
  void findsByOwnerAndTag() {
    var owner = em.persist(new User("ann@example.com"));
    var tag = em.persist(new Tag("java"));
    var b = new Bookmark("https://spring.io", "Spring");
    b.setOwner(owner); b.getTags().add(tag);
    em.persistAndFlush(b);
    em.clear();                                            // force a real SELECT, not the first-level cache

    assertThat(bookmarks.findByOwnerAndTag(owner.getId(), "java"))
        .extracting(Bookmark::getTitle).containsExactly("Spring");
  }
}
```

What the slice does: configures only JPA (entities, repositories, `EntityManager`, Flyway or Hibernate DDL), no web layer and no `@Service` beans; by default swaps the datasource for an embedded one (hence `Replace.NONE` with Testcontainers); wraps each test in a transaction that rolls back at the end, so tests do not see each other's data; and provides `TestEntityManager` for arranging state without going through the repository under test.

`@DataJpaTest` with `Replace.NONE` runs your Flyway migrations against the container, so the test also proves the migration set builds a schema the entities validate against. That is the single most valuable persistence test you can have.

For services with transactions, mocks, and the web layer, use `@SpringBootTest`; `@DataJpaTest` is for repositories and mappings.

## Seeding test data

- `TestEntityManager.persist`/`persistAndFlush` for a handful of rows per test, with small builder methods (`aBookmark().ownedBy(ann).tagged("java")`) so tests read as intent.
- `@Sql("/sql/bookmarks-seed.sql")` on the class or method for larger fixed fixtures; `@Sql(scripts = …, executionPhase = AFTER_TEST_METHOD)` to clean up when tests commit.
- A test-only Flyway location (`spring.flyway.locations=classpath:db/migration,classpath:db/testdata` in a test profile) for reference data every test expects. Keep it out of the main jar.
- Avoid one giant shared fixture; tests that depend on "user 3 has 7 bookmarks" break on every unrelated change.
- Flush and clear after arranging data. Without `em.clear()` the repository returns the same instances you just persisted from the first-level cache and a broken query can still pass.

## Testing transactional behaviour

The trap: a `@Transactional` test wraps the service call, so the service's `REQUIRED` transaction joins the test's and nothing commits; constraint violations surface only at flush, and lazy loading "works" everywhere because the session is still open. Rules:

- Do not put `@Transactional` on tests of transactional services. Let the service commit, then assert through the repository and clean up with `@Sql` or `deleteAll` in `@AfterEach`. `@SpringBootTest` does not add a test transaction unless you ask.
- To test rollback on failure: call the service with input that fails after a write, `assertThrows`, then assert the write is gone.

```java
@Test
void createRollsBackWhenTagLimitExceeded() {
  assertThatThrownBy(() -> service.create(ann.getId(), requestWithTags(51)))
      .isInstanceOf(TagLimitExceededException.class);
  assertThat(bookmarks.countByOwnerId(ann.getId())).isZero();
}
```

- To test `REQUIRES_NEW` (an audit row that must survive a rollback): same shape, assert the audit row exists after the outer failure.
- When you do want the test transaction (repository slices), remember `flush()` to trigger constraint checks: `assertThatThrownBy(() -> em.persistAndFlush(duplicate)).isInstanceOf(PersistenceException.class)` (Spring translates it to `DataIntegrityViolationException` only when going through a repository).
- Use `TransactionTemplate` in tests to run arrange/assert steps in explicit, committed transactions when you need lazy loading in the assertion.
- Test `@Transactional(readOnly = true)` methods for N+1 with a statement-count assertion rather than by eyeballing logs.

## Common interview questions

**How do you manage schema changes?**
Versioned SQL migrations with Flyway, applied at startup and recorded in a history table; Hibernate runs in `validate` mode so a mismatch between entities and schema fails the deploy instead of corrupting data. Applied migrations are immutable; fixes are new files.

**Why not `ddl-auto=update` in production?**
It only ever adds, never drops or renames, so the schema drifts; it cannot do data migrations or careful online changes; it runs unreviewed at startup on whichever instance boots first; and its output changes with Hibernate versions. Migrations are code and go through review.

**How do you make a column non-null on a large live table?**
Expand/contract: add it nullable, backfill in batches in a separate migration or job, add the `NOT NULL` constraint once every row has a value (Postgres can validate a `CHECK` constraint without a long lock), and remove the old path in a later release.

**H2 or Testcontainers for repository tests?**
Testcontainers, because tests against a different database do not test the SQL you ship, and Postgres-specific migrations will not even run on H2. The cost is Docker and a few seconds of startup, amortised by reuse.

**What does `@DataJpaTest` give you?**
A JPA-only application context with repositories, `TestEntityManager`, and per-test rollback transactions. By default it replaces the datasource with an embedded one, so with Testcontainers you set `Replace.NONE`.

**Why can a repository test pass while the query is wrong?**
Because inside one transaction the first-level cache returns the entities you just persisted without consulting the database. `flush()` then `clear()` before the call under test forces real SQL.

**How do you test that a service rolls back?**
Without a test transaction, trigger a failure after the first write, assert the exception, then assert through a repository that nothing was persisted. For `REQUIRES_NEW` paths, assert the side effect that should have survived.

## Pitfalls

- Editing an applied migration to "fix a typo": checksum mismatch in every environment that already ran it.
- `baseline-on-migrate=true` left on in a fresh environment: a real empty database gets baselined and `V1` never runs.
- `@Transactional` on an integration test of a method that uses `REQUIRES_NEW` or `@Async`: the inner work runs outside the test transaction and leaks between tests.
- Static Testcontainers in every class without reuse: a fresh database per class, minutes added to CI.
- A `@DataJpaTest` that passes on H2 and a migration that fails on the first Postgres deploy.
