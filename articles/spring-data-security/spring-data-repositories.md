---
title: Spring Data Repositories
order: 2
summary: JpaRepository, derived queries, @Query with JPQL and native SQL, pagination, specifications, @Modifying, Optional returns, and when to drop to JdbcClient.
---

Spring Data JPA turns an interface into a working data-access layer, and interviewers want to know you understand what it generates, where derived queries stop being readable, and when a hand-written query or plain JDBC is the honest answer. Nobody is impressed by a 90-character method name.

## The repository hierarchy

```java
public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {}
```

| Interface | Adds | Note |
|---|---|---|
| `Repository<T, ID>` | nothing; marker | Use it to expose only the methods you declare |
| `CrudRepository` | `save`, `saveAll`, `findById`, `existsById`, `findAll`, `count`, `deleteById`, `delete` | `findAll` returns `Iterable` |
| `ListCrudRepository` | same, returning `List` | Spring Data 3 |
| `PagingAndSortingRepository` / `ListPagingAndSortingRepository` | `findAll(Pageable)`, `findAll(Sort)` | |
| `JpaRepository` | all of the above plus `flush`, `saveAndFlush`, `deleteAllInBatch`, `getReferenceById` | JPA-specific; ties you to JPA |

Spring scans for interfaces extending these, creates a proxy per interface backed by `SimpleJpaRepository`, and registers it as a bean. Every `SimpleJpaRepository` method is `@Transactional(readOnly = true)` at class level with writes overridden to read-write, so a repository call outside a service transaction still runs in its own short transaction.

`getReferenceById` returns a lazy proxy without hitting the DB; use it to set a `@ManyToOne` by id (`bookmark.setOwner(users.getReferenceById(ownerId))`) without a `SELECT`.

## Derived queries

The method name is parsed into JPQL at startup; a typo fails the context, not the request.

```java
List<Bookmark> findByOwnerIdOrderByCreatedAtDesc(Long ownerId);
Optional<Bookmark> findByOwnerIdAndUrl(Long ownerId, String url);
boolean existsByOwnerIdAndUrl(Long ownerId, String url);
long countByOwnerId(Long ownerId);
List<Bookmark> findTop5ByOwnerIdOrderByCreatedAtDesc(Long ownerId);
List<Bookmark> findByTitleContainingIgnoreCase(String fragment);
List<Bookmark> findByTagsNameIn(Collection<String> tagNames);     // joins through tags.name
Slice<Bookmark> findByOwnerId(Long ownerId, Pageable page);
void deleteByOwnerId(Long ownerId);                                // loads then deletes one by one
```

Keywords you should recognise: `And`, `Or`, `Between`, `LessThan`, `After`, `IsNull`, `In`, `StartingWith`, `Containing`, `IgnoreCase`, `OrderBy…Asc/Desc`, `Top`/`First`, `Distinct`, and the prefixes `find`, `read`, `get`, `query`, `count`, `exists`, `delete`, `remove`.

Rule of thumb: two conditions and an order, fine. Three or more, or anything with a join, write `@Query`. The generated name becomes the API, and the next reader has to parse it.

## @Query: JPQL and native

```java
@Query("""
    select b from Bookmark b
    join b.tags t
    where b.owner.id = :ownerId and t.name = :tag
    """)
List<Bookmark> findByOwnerAndTag(Long ownerId, String tag);

@Query(value = """
    select * from bookmarks
    where owner_id = :ownerId
      and to_tsvector('english', title) @@ plainto_tsquery(:q)
    """, nativeQuery = true)
List<Bookmark> search(Long ownerId, String q);
```

- JPQL speaks in entities and fields (`b.owner.id`), native SQL in tables and columns. JPQL is portable across databases and validated at startup; native lets you use Postgres features (full-text, `jsonb`, window functions).
- Named parameters `:ownerId` bind to method parameters by name because Boot compiles with `-parameters`. Add `@Param("ownerId")` if the build does not, or for clarity.
- Native queries returning entities need every mapped column selected; returning a projection works with an interface projection whose getter names match column aliases.
- Positional `?1` parameters exist; avoid them.

## Pagination

```java
Page<Bookmark> findByOwnerId(Long ownerId, Pageable pageable);

// service
var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
Page<BookmarkSummary> result = repo.findByOwnerId(ownerId, pageable).map(BookmarkSummary::from);
```

- `Page<T>` runs a second `count` query so it can report `totalElements` and `totalPages`. `Slice<T>` fetches `size + 1` rows and only knows whether there is a next page; cheaper for infinite scroll. `List<T>` with a `Pageable` just applies `LIMIT`/`OFFSET`.
- `@Query` plus `Pageable` works; for complex JPQL provide `countQuery` so Spring does not derive a wrong one.
- Controllers can take `Pageable` directly (`?page=0&size=20&sort=createdAt,desc`), with `spring.data.web.pageable.max-page-size` capping abuse. Do not serialise `Page` itself to JSON: its shape is not a stable contract. Since Spring Data 3.3, return `PagedModel` (`new PagedModel<>(page)`) or your own `PageResponse` record; Spring Data logs a warning the first time a `PageImpl` is serialised directly.
- Offset pagination degrades on deep pages because the DB still scans the skipped rows. Keyset pagination (`where (created_at, id) < (:lastCreatedAt, :lastId) order by created_at desc, id desc limit :n`) is the follow-up answer; Spring Data 3.1+ supports it via `ScrollPosition.keyset()` and `Window<T>`.

## Specifications, in one paragraph

For filters that combine optionally (owner, tag, date range, text), extend `JpaSpecificationExecutor<Bookmark>` and compose `Specification<Bookmark>` objects: each is a lambda `(root, query, cb) -> cb.equal(root.get("ownerId"), id)` over the JPA Criteria API, combined with `.and()` and `.or()` (or `Specification.allOf`/`anyOf`, available since Spring Data JPA 3.0; `Specification.where` is deprecated from 3.5 in favour of `unrestricted()`). Keep static factory methods on the repository or a `BookmarkSpecs` class, and skip null filters by returning `null` from the spec (treated as "no restriction"). It beats building JPQL strings by hand and type-safe metamodel classes (`Bookmark_.title`) remove the stringly-typed `root.get("title")`. Querydsl is the alternative with nicer syntax and an annotation processor.

## @Modifying

```java
@Modifying(clearAutomatically = true)
@Transactional
@Query("update Bookmark b set b.archived = true where b.owner.id = :ownerId and b.createdAt < :before")
int archiveOlderThan(Long ownerId, Instant before);
```

- Bulk JPQL `update`/`delete` executes directly in the database and bypasses the persistence context: already-loaded entities keep their old state and `@Version` is not incremented unless you write it. `clearAutomatically = true` clears the context after, `flushAutomatically = true` flushes pending changes before.
- Needs a transaction; the read-only default on `SimpleJpaRepository` does not apply to your custom method, so add `@Transactional` on the method or call from a transactional service.
- Prefer it over `findAll` → loop → `save` for anything touching more than a handful of rows. Derived `deleteBy…` loads every entity and deletes one by one so that lifecycle callbacks and cascades run; bulk `@Modifying` delete does not.

## Optional and null returns

- `findById` returns `Optional<T>`. Derived single-result queries can be declared as `Optional<T>`, `T` (null when absent), or throw `IncorrectResultSizeDataAccessException` if more than one row matches.
- In a service: `repo.findById(id).orElseThrow(() -> new NotFoundException("bookmark", id))`, mapped to a 404 by your `ProblemDetail` handler. Do not return `Optional` from controllers or pass it as a parameter.
- Collections never return null; an empty `List` is the no-results answer.
- `Stream<T>` return types need to be consumed inside a transaction and closed (`try-with-resources`); useful for exports.

## When to drop to JdbcTemplate or JdbcClient

JPA earns its keep when you load an aggregate, mutate it, and let dirty checking write it back. It gets in the way for reporting queries, bulk loads, upserts (`insert … on conflict`), and anything where you want the exact SQL you wrote.

```java
@Repository
public class BookmarkStatsDao {
  private final JdbcClient jdbc;
  BookmarkStatsDao(JdbcClient jdbc) { this.jdbc = jdbc; }

  public List<TagCount> topTags(long ownerId, int limit) {
    return jdbc.sql("""
        select t.name, count(*) as cnt
        from bookmark_tags bt join tags t on t.id = bt.tag_id
        join bookmarks b on b.id = bt.bookmark_id
        where b.owner_id = :ownerId
        group by t.name order by cnt desc limit :limit
        """)
      .param("ownerId", ownerId)
      .param("limit", limit)
      .query((rs, i) -> new TagCount(rs.getString("name"), rs.getLong("cnt")))
      .list();
  }
}
```

`JdbcClient` (Spring 6.1) is the fluent API over `JdbcTemplate`/`NamedParameterJdbcTemplate`; same `DataSource`, same transaction manager, so it participates in `@Transactional` alongside JPA. Spring Data JDBC is the middle ground: repositories and aggregates without a persistence context or lazy loading. The answer interviewers want: "JPA for the aggregates I mutate, SQL for the queries I read, both in the same transaction."

## Worked example: dynamic search with Specifications

A search screen filters products by optional name, category, price range and availability. Writing a derived query for every combination is impossible; Specifications compose predicates:

```java
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {}

final class ProductSpecs {
    static Specification<Product> nameContains(String text) {
        return (root, query, cb) -> text == null ? null
            : cb.like(cb.lower(root.get("name")), "%" + text.toLowerCase() + "%");
    }

    static Specification<Product> inCategory(String category) {
        return (root, query, cb) -> category == null ? null : cb.equal(root.get("category"), category);
    }

    static Specification<Product> priceBetween(BigDecimal min, BigDecimal max) {
        return (root, query, cb) -> {
            if (min == null && max == null) return null;
            if (min == null) return cb.lessThanOrEqualTo(root.get("price"), max);
            if (max == null) return cb.greaterThanOrEqualTo(root.get("price"), min);
            return cb.between(root.get("price"), min, max);
        };
    }

    static Specification<Product> inStock(Boolean onlyInStock) {
        return (root, query, cb) -> Boolean.TRUE.equals(onlyInStock) ? cb.greaterThan(root.get("stock"), 0) : null;
    }
}

Page<Product> search(ProductFilter f, Pageable page) {
    Specification<Product> spec = Specification.allOf(
        ProductSpecs.nameContains(f.name()),
        ProductSpecs.inCategory(f.category()),
        ProductSpecs.priceBetween(f.minPrice(), f.maxPrice()),
        ProductSpecs.inStock(f.inStock()));
    return products.findAll(spec, page);
}
```

A specification that returns `null` adds no condition, so only the filters the user actually set appear in the `WHERE` clause. Parameters are bound, not concatenated, so the `like` pattern is safe from SQL injection. Whitelist sortable fields from the `Pageable` before passing it through, since users can otherwise sort by any mapped property.

Alternatives: Querydsl (type-safe generated query classes), `@Query` with `(:name is null or …)` conditions for a handful of filters, or `JdbcClient` with a small query builder when the SQL is complex.

## Common interview questions

**How does Spring Data create an implementation from an interface?**
At startup it scans for repository interfaces, builds a JDK proxy for each backed by `SimpleJpaRepository`, and parses every declared method into either a derived JPQL query, an annotated `@Query`, or a custom fragment implementation. Parse errors fail the application context, not the first call.

**When would you write `@Query` instead of a derived method?**
As soon as the method name needs more than two conditions, a join, a projection, or a feature the parser cannot express. The name is the API; if it is not readable at a glance, a JPQL string next to it is clearer.

**What is the difference between `Page` and `Slice`?**
`Page` runs an extra count query to report totals; `Slice` fetches one row more than the page size and only knows whether there is a next page. Use `Slice` for infinite scroll and `Page` when the UI shows page numbers.

**Why does a bulk `@Modifying` update leave stale entities in memory?**
Because JPQL bulk statements go straight to the database without touching the persistence context. Entities loaded earlier in the transaction still hold the old values; `clearAutomatically = true` or `entityManager.clear()` detaches them so the next read is fresh.

**How do you handle a missing row?**
`findById` returns `Optional`; the service calls `orElseThrow` with a domain exception that the `@RestControllerAdvice` turns into a 404 Problem Details response. Optionals stop at the service boundary.

**When do you bypass JPA?**
Reporting and aggregation queries, bulk inserts, upserts, and anything where exact SQL matters. `JdbcClient` shares the `DataSource` and transaction manager, so it mixes with JPA in one transaction.

**What happens if two threads call `save` on the same entity?**
Last write wins unless the entity has a `@Version` column, in which case the second commit fails with an optimistic locking exception. For counters and inventory, a bulk update statement or a pessimistic lock avoids the lost update.

## Pitfalls

- Derived `deleteBy…` loads every row before deleting. For thousands of rows, use a `@Modifying` delete.
- `findAll()` with no `Pageable` on a growing table: there is always a future where it loads millions of rows.
- Native queries with `select *` that stop matching the entity after a migration adds a column with no default mapping.
- `Sort.by("owner.name")` on a derived query joins silently; on a native query it fails because the property is not a column.
- Returning `Page` entities straight from a controller: Jackson serialises every lazy association it can reach.

## Key takeaways

- Extend `JpaRepository` (or a narrower interface) and let Spring Data generate implementations.
- Derived queries suit simple lookups; `@Query` handles anything longer; Specifications or Querydsl handle dynamic filters.
- Return `Optional` for single results, `Page`/`Slice` for paged lists, and projections for read models.
- `@Modifying` queries bypass the persistence context; clear it or reload afterwards.
- Drop to `JdbcClient` for reporting SQL and bulk operations.
