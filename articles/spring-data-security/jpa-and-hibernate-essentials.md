---
title: JPA and Hibernate Essentials
order: 1
summary: Entities, id generation, relationships and the owning side, fetch types, the persistence context and entity states, equals/hashCode, and DTO projections.
---

JPA questions are where interviewers check whether you understand what the ORM is doing under your repository calls, or whether you only know `findAll`. If you can explain the persistence context, the owning side of a relationship, and why `LAZY` is the right default, you clear most of the round. Coming from JS: think of Hibernate as Prisma or TypeORM with a much stronger unit-of-work layer sitting between your objects and the SQL.

## JPA vs Hibernate vs Spring Data

This is asked because many candidates use the three names interchangeably.

| Layer | What it is | Examples |
|---|---|---|
| JPA (Jakarta Persistence) | A specification: annotations and interfaces, no code that runs | `@Entity`, `EntityManager`, JPQL |
| Hibernate | The implementation Boot uses by default; generates SQL, caches, dirty-checks | `Session`, `@BatchSize`, dialects |
| Spring Data JPA | A repository abstraction on top of JPA: interfaces you declare, proxies Spring generates | `JpaRepository`, derived queries, `@Query` |

Say: "I code against JPA annotations and Spring Data interfaces; Hibernate is the engine doing the SQL, and I reach for Hibernate-specific features only when I need them, like batch fetching."

## Entities and ids

```java
@Entity
@Table(name = "bookmarks")
public class Bookmark {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, length = 2048)
  private String url;

  private String title;

  @Enumerated(EnumType.STRING)
  private Visibility visibility = Visibility.PRIVATE;

  @CreationTimestamp
  private Instant createdAt;

  protected Bookmark() {}          // JPA needs a no-arg constructor

  public Bookmark(String url, String title) { this.url = url; this.title = title; }

  // getters, minimal setters
}
```

Points to make:

- Entities are mutable classes with a no-arg constructor; records cannot be entities (Hibernate needs to proxy and mutate them). Records are great as DTOs.
- Always `@Enumerated(EnumType.STRING)`. The default `ORDINAL` breaks the moment someone reorders the enum.
- Use `Instant` or `LocalDateTime` for timestamps, never `java.util.Date`.

### Generation strategies

| Strategy | SQL | Trade-off |
|---|---|---|
| `IDENTITY` | auto-increment column | Simple; Hibernate must insert immediately to learn the id, so JDBC batch inserts are disabled |
| `SEQUENCE` | `nextval('bookmarks_seq')` | Ids known before insert, allows batching; Hibernate 6 defaults to `<table>_seq` with `allocationSize` 50 |
| `UUID` | app-generated UUID | No DB round trip, safe to expose, larger index; `GenerationType.UUID` since JPA 3.1 |
| `AUTO` | dialect picks | On Postgres resolves to `SEQUENCE`; on MySQL to `TABLE` in older setups, so be explicit |

For Postgres, `SEQUENCE` is the professional answer; `IDENTITY` is fine for MySQL and for small services. If you say `SEQUENCE`, know that `allocationSize` must match the DB sequence's `INCREMENT BY` or you get id gaps and collisions.

## Relationships and ownership

```java
@Entity
public class Bookmark {
  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "owner_id")
  private User owner;                       // owning side: this table has the FK

  @ManyToMany
  @JoinTable(name = "bookmark_tags",
      joinColumns = @JoinColumn(name = "bookmark_id"),
      inverseJoinColumns = @JoinColumn(name = "tag_id"))
  private Set<Tag> tags = new HashSet<>();
}

@Entity
public class User {
  @OneToMany(mappedBy = "owner")             // inverse side: mirrors the FK, owns nothing
  private List<Bookmark> bookmarks = new ArrayList<>();
}
```

- The owning side is the one that maps the foreign key column; it is the `@ManyToOne` in a one-to-many, or the side with `@JoinTable` in a many-to-many. Hibernate writes SQL only based on the owning side. Adding a bookmark to `user.getBookmarks()` without setting `bookmark.setOwner(user)` persists nothing.
- `mappedBy` names the field on the other entity that owns the relationship. It is the "I'm just a view" marker.
- Prefer unidirectional `@ManyToOne` and query the children when you need them. Bidirectional collections cost sync helpers (`addBookmark` that sets both sides) and invite N+1.
- For many-to-many with extra columns (who added the tag, when), model an explicit join entity (`BookmarkTag`) with two `@ManyToOne`s.
- `cascade = CascadeType.ALL` and `orphanRemoval = true` belong on true parent-child relationships (order → order lines), not on associations between independent aggregates (bookmark → tag). Cascading `REMOVE` through a shared entity deletes other people's data.

## Fetch types

| Association | JPA default | What you should write |
|---|---|---|
| `@ManyToOne`, `@OneToOne` | `EAGER` | `fetch = FetchType.LAZY` |
| `@OneToMany`, `@ManyToMany` | `LAZY` | leave `LAZY` |

Eager is a global decision made at mapping time; it cannot be undone per query, and every load of a bookmark drags its owner along, even in a list of 500. Lazy is a default you can override per query with `JOIN FETCH` or an entity graph. So: lazy everywhere, fetch explicitly where a use case needs it. Lazy `@ManyToOne` works through a proxy subclass; lazy collections through Hibernate's `PersistentBag`/`PersistentSet`. Both throw `LazyInitializationException` if touched after the session closed (see the N+1 article).

## The persistence context and entity states

The persistence context is the unit of work attached to an `EntityManager` and, in Spring, to the current transaction. It is a map of id → managed entity instance. Three guarantees follow:

1. Identity: loading the same row twice in one transaction returns the same Java object (first-level cache).
2. Dirty checking: at flush, Hibernate diffs every managed entity against its loaded snapshot and issues `UPDATE`s for the changed ones. You do not call `save` after modifying a managed entity.
3. Write-behind: SQL is deferred until flush (before a query that might need it, or at commit), so Hibernate can order and batch statements.

```java
@Transactional
public void rename(long id, String title) {
  Bookmark b = repo.findById(id).orElseThrow();   // managed
  b.setTitle(title);                              // dirty
}                                                 // commit: flush issues one UPDATE
```

| State | Meaning | How you get there |
|---|---|---|
| New (transient) | Plain object, no id, unknown to the context | `new Bookmark(...)` |
| Managed | Tracked; changes are flushed automatically | `persist`, `find`, any query result |
| Detached | Was managed, context closed or `detach`/`clear` called; changes not tracked | after the transaction ends |
| Removed | Scheduled for `DELETE` at flush | `remove` |

`persist(new)` makes it managed. `merge(detached)` copies state onto a managed copy and returns that copy, the original stays detached; this is the classic trap. Spring Data's `save` calls `persist` when the entity is new (null id or `Persistable.isNew`) and `merge` otherwise, which is why `save` on a detached entity issues a `SELECT` before the `UPDATE`.

Hibernate specifics worth naming: `Session` is Hibernate's `EntityManager`; `FlushMode.AUTO` flushes before JPQL/native queries that touch affected tables; `entityManager.clear()` is how you keep memory bounded in a batch job.

## equals and hashCode on entities

The problem: a new entity has `id == null` until flush; if `hashCode` depends on the id, the object changes its hash after being added to a `HashSet`, and the set can no longer find it. Default identity-based `equals` breaks the moment the same row is loaded in two contexts.

Two accepted answers:

```java
// 1. Id-based equality with a constant hashCode (Vlad Mihalcea's approach)
@Override public boolean equals(Object o) {
  if (this == o) return true;
  if (!(o instanceof Bookmark other)) return false;    // instanceof, not getClass: proxies are subclasses
  return id != null && id.equals(other.getId());         // call the getter: proxies need initialising
}
@Override public int hashCode() { return Bookmark.class.hashCode(); }

// 2. Natural/business key (email, ISBN, slug) that is set at construction and never changes
```

The constant `hashCode` means all bookmarks land in one bucket of a `HashSet`, which is fine because sets of entities are small. Never generate `equals`/`hashCode` over all fields, and do not include lazy collections.

## DTO projections

Loading entities to serialise them is the single most common performance mistake: you pay for dirty-check snapshots, you expose lazy fields to Jackson, and you fetch columns you do not need. Three ways to get read-only shapes straight from the query:

```java
public record BookmarkSummary(Long id, String title, String url) {}

// JPQL constructor expression (works with records)
@Query("select new com.example.bookmarks.BookmarkSummary(b.id, b.title, b.url) from Bookmark b where b.owner.id = :ownerId")
List<BookmarkSummary> summariesFor(Long ownerId);

// Spring Data interface projection (closed projection: only these columns are selected)
interface TagCount { String getName(); long getCount(); }

// Spring Data class/record projection from a derived query
List<BookmarkSummary> findByOwnerId(Long ownerId);
```

Hibernate 6 also lets you skip the package name in JPQL when the record is imported (`select new BookmarkSummary(...)`) and, in Hibernate 6.x, can map to a record with no `new` keyword when the record is the declared return type and the select list matches.

Say: "Entities for writes inside a transaction, projections for reads at the API boundary."

## Common interview questions

**What is the difference between JPA, Hibernate and Spring Data JPA?**
JPA is the specification (annotations, `EntityManager`, JPQL), Hibernate is the implementation that generates the SQL, and Spring Data JPA is a repository layer that generates implementations from interfaces. In a Boot app you write against the first and third and let the second do the work.

**What does the persistence context do for you?**
It is the unit of work: it caches loaded entities by id so you get one instance per row per transaction, tracks changes and flushes them as `UPDATE`s at commit, and defers SQL so statements can be batched. It is why you do not call `save` after changing a managed entity.

**Why is `FetchType.LAZY` recommended everywhere?**
Eager fetching is decided once in the mapping and applies to every query, so a list endpoint drags associations it never shows. Lazy keeps the base query cheap and lets each use case fetch what it needs with `JOIN FETCH` or an entity graph.

**What is the owning side of a relationship?**
The side that maps the foreign key, so a `@ManyToOne` or the side with `@JoinTable`. Hibernate writes SQL based only on the owning side; the `mappedBy` side is a read-only mirror. Forgetting this is why "I added it to the list but it did not save".

**Which id generation strategy would you choose and why?**
`SEQUENCE` on Postgres: ids are known before insert, which allows JDBC batching, and the allocation size cuts round trips. `IDENTITY` is simpler but forces an immediate insert per entity. UUIDs when ids must be generated client-side or must not be guessable.

**How should an entity implement `equals` and `hashCode`?**
Either on a stable business key, or on the id with a constant `hashCode`, so the hash does not change when the id is assigned at flush. Use `instanceof` because Hibernate proxies are subclasses, and compare through getters so a proxy is initialised.

**`persist` vs `merge`?**
`persist` takes a new object and makes that same instance managed. `merge` copies the state of a detached object onto a managed instance and returns the managed copy; the argument stays detached. Spring Data's `save` picks one by checking whether the entity is new.

**Why not return entities from controllers?**
Jackson will walk lazy associations outside the transaction (lazy-init exceptions or accidental N+1), you leak the schema into the API, and you cannot evolve the two independently. Return records or projections.

## Pitfalls

- `@Data` from Lombok on an entity: generates `equals`/`hashCode` over all fields and `toString` that touches lazy collections.
- `@OneToMany` without `mappedBy` creates a surprise join table.
- Setting `cascade = ALL` on `@ManyToMany`: removing one bookmark deletes shared tags.
- Mixing `List` and `Set` carelessly: two `List` collections fetched in one query throw `MultipleBagFetchException`; `Set` avoids it.
- Expecting a lazy `@OneToOne` on the inverse (`mappedBy`) side to be lazy: without the foreign key Hibernate cannot know whether to create a proxy or `null`, so it loads eagerly. Map the owning side, or make it a `@ManyToOne` with a unique constraint.
- Leaving `optional = true` on a required `@ManyToOne`: Hibernate must use an outer join and cannot assume the row exists; `optional = false` gives an inner join and a `NOT NULL` column.
