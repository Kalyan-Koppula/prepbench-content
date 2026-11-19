---
title: Capstone, a Bookmarks Service
order: 2
summary: The spec, package layout, build order and "walk me through your project" narrative for a bookmarks API with JWT auth, JPA and Flyway, Problem Details, pagination, three levels of tests and a Dockerfile.
---

You need one project you can talk about for twenty minutes under questioning. It should be small enough to finish in a week and real enough to contain every decision a Spring interviewer asks about. A bookmarks API hits that: users, ownership, a many-to-many, auth, validation, pagination, and nothing that needs a third-party API.

## The spec

Users register and log in; each user has bookmarks; a bookmark has a URL, title, optional notes, visibility, and zero or more tags; tags are per user. Everything below `/bookmarks` requires a bearer token and is scoped to the caller.

| Method and path | Auth | Behaviour |
|---|---|---|
| `POST /auth/register` | none | `{email, password}` → 201, no body; 409 if the email exists |
| `POST /auth/login` | none | `{email, password}` → `{accessToken, expiresIn}`; 401 on bad credentials |
| `GET /bookmarks?tag=&q=&page=&size=&sort=` | user | Page of the caller's bookmarks, filtered |
| `POST /bookmarks` | user | `{url, title, notes?, tags?: string[], visibility?}` → 201 + `Location` |
| `GET /bookmarks/{id}` | user | 404 if missing or owned by someone else |
| `PUT /bookmarks/{id}` | user | Full replace; 409 on optimistic-lock conflict |
| `DELETE /bookmarks/{id}` | user | 204 |
| `GET /tags` | user | Caller's tags with counts |
| `GET /actuator/health` | none | liveness/readiness |

Rules: validation errors and all failures return RFC 9457 Problem Details; `GET /bookmarks/{id}` for someone else's bookmark is 404, not 403, so ids do not leak existence; max 20 tags per bookmark; access tokens live 15 minutes.

## Package layout

Package by feature, not by layer. It keeps each slice readable in one screen and makes the "where would you add X" question easy.

```text
com.example.bookmarks
├── BookmarksApplication.java
├── auth/
│   ├── AuthController.java          POST /auth/register, /auth/login
│   ├── AuthService.java             register(), login() → token
│   ├── TokenService.java            JwtEncoder wrapper
│   └── JpaUserDetailsService.java
├── user/
│   ├── User.java                    entity: id, email (unique), passwordHash, roles, createdAt
│   └── UserRepository.java
├── bookmark/
│   ├── Bookmark.java                entity: owner, url, title, notes, visibility, tags, @Version
│   ├── BookmarkRepository.java      JpaRepository + JpaSpecificationExecutor
│   ├── BookmarkSpecs.java           ownedBy(), tagged(), matching()
│   ├── BookmarkService.java         @Transactional use cases
│   ├── BookmarkController.java
│   └── dto/                         CreateBookmarkRequest, BookmarkResponse, PageResponse (records)
├── tag/
│   ├── Tag.java                     entity: owner, name; unique (owner_id, name)
│   ├── TagRepository.java
│   └── TagController.java
├── common/
│   ├── ApiExceptionHandler.java     @RestControllerAdvice → ProblemDetail
│   ├── NotFoundException.java, ConflictException.java
│   └── CurrentUser.java             resolves the Jwt subject to a user id
└── config/
    ├── SecurityConfig.java
    ├── JwtConfig.java               encoder/decoder from app.jwt.secret
    └── AppProperties.java           @ConfigurationProperties("app") record
```

Dependencies: `web`, `validation`, `data-jpa`, `security`, `oauth2-resource-server`, `actuator`, `flyway-core` + `flyway-database-postgresql`, `postgresql`, and for tests `spring-boot-starter-test`, `spring-security-test`, `spring-boot-testcontainers`, `testcontainers:postgresql`.

## Build order

Each step ends with a running app and a passing test; do not go wide before the walking skeleton stands.

1. Skeleton: Spring Initializr, Postgres in `compose.yaml` (Boot's Docker Compose support starts it with the app), `open-in-view: false`, `ddl-auto: validate`, `V1__users.sql`, `V2__bookmarks_and_tags.sql`. Test: context loads against Testcontainers.
2. Users and auth: `User` entity, `UserRepository`, BCrypt via `DelegatingPasswordEncoder`, `JpaUserDetailsService`, `AuthController` with register/login, `TokenService` issuing HS256 JWTs, `SecurityConfig` as a stateless resource server. Tests: `@WebMvcTest(AuthController)` for validation and status codes; `@SpringBootTest` for register → login → call a protected endpoint with the token.
3. Bookmarks CRUD: entity with lazy `@ManyToOne` owner, `@Version`, service with `@Transactional` methods scoped by owner id from the JWT subject, controller with `@Valid` records, `Location` header on create. Tests: `@DataJpaTest` for the repository, Mockito unit tests for the service, `@WebMvcTest` with `jwt()` for the controller.
4. Problem Details: `ApiExceptionHandler extends ResponseEntityExceptionHandler`; override `handleMethodArgumentNotValid` to add an `errors` array; map `NotFoundException` → 404, `ConflictException`/`DataIntegrityViolationException` → 409, `ObjectOptimisticLockingFailureException` → 409, everything else → 500 without the stack trace. Set `spring.mvc.problemdetails.enabled=true` so Spring's own errors use the same format.
5. Tags and filtering: `Tag` entity, `@ManyToMany` from bookmark with a `Set`, `BookmarkSpecs` combined from optional query params, `Page` mapped to `PageResponse` records, `default_batch_fetch_size: 50`. Test: a statement-count assertion that listing 20 bookmarks with tags is 2 queries, not 21.
6. Hardening: `@ConfigurationProperties` for the JWT secret and token TTL with validation that fails startup when missing; Actuator health with the DB indicator and `management.endpoints.web.exposure.include=health,info,metrics,prometheus`; request logging with a correlation id filter; `max-page-size` capped at 100.
7. Container: multi-stage Dockerfile, `compose.yaml` for app plus Postgres, README with curl examples. Run the whole thing from a clean clone.

## Code you should be able to reproduce

The error handler, because every interviewer asks about error contracts:

```java
@RestControllerAdvice
public class ApiExceptionHandler extends ResponseEntityExceptionHandler {

  @ExceptionHandler(NotFoundException.class)
  ProblemDetail notFound(NotFoundException ex) {
    var pd = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
    pd.setType(URI.create("https://example.com/problems/not-found"));
    return pd;
  }

  @ExceptionHandler({ConflictException.class, ObjectOptimisticLockingFailureException.class})
  ProblemDetail conflict(Exception ex) {
    return ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, "The resource was modified concurrently");
  }

  @Override
  protected ResponseEntity<Object> handleMethodArgumentNotValid(MethodArgumentNotValidException ex,
      HttpHeaders headers, HttpStatusCode status, WebRequest request) {
    var pd = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Validation failed");
    pd.setProperty("errors", ex.getFieldErrors().stream()
        .map(f -> Map.of("field", f.getField(), "message", String.valueOf(f.getDefaultMessage())))
        .toList());
    return ResponseEntity.status(status).body(pd);
  }
}
```

The request record with validation:

```java
public record CreateBookmarkRequest(
    @NotBlank @Size(max = 2048) @URL String url,
    @NotBlank @Size(max = 200) String title,
    @Size(max = 4000) String notes,
    @Size(max = 20) Set<@NotBlank @Size(max = 40) String> tags,
    Visibility visibility) {

  public CreateBookmarkRequest {
    tags = tags == null ? Set.of() : Set.copyOf(tags);
    visibility = visibility == null ? Visibility.PRIVATE : visibility;
  }
}
```

The service method that shows transaction, ownership, and the tag upsert:

```java
@Transactional
public BookmarkResponse create(long ownerId, CreateBookmarkRequest req) {
  var owner = users.getReferenceById(ownerId);                     // no SELECT, just the FK
  var tags = req.tags().stream()
      .map(name -> tagRepo.findByOwnerIdAndName(ownerId, name)
          .orElseGet(() -> tagRepo.save(new Tag(owner, name))))
      .collect(Collectors.toSet());
  var bookmark = new Bookmark(owner, req.url(), req.title(), req.notes(), req.visibility(), tags);
  return BookmarkResponse.from(bookmarks.save(bookmark));
}
```

The Dockerfile:

```text
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY mvnw pom.xml ./
COPY .mvn .mvn
RUN ./mvnw -q dependency:go-offline
COPY src src
RUN ./mvnw -q -DskipTests package && cp target/*.jar application.jar
RUN java -Djarmode=tools -jar application.jar extract --layers --destination extracted

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app
USER app
COPY --from=build /app/extracted/dependencies/ ./
COPY --from=build /app/extracted/spring-boot-loader/ ./
COPY --from=build /app/extracted/snapshot-dependencies/ ./
COPY --from=build /app/extracted/application/ ./
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "application.jar"]
```

Layered extraction (`-Djarmode=tools`, Boot 3.3+) means the dependency layer is cached between builds and only the application layer changes. `./mvnw spring-boot:build-image` (Buildpacks) is the no-Dockerfile alternative; know both.

## Tests at three levels

| Level | Annotation | Speed | What it proves |
|---|---|---|---|
| Unit | none; Mockito for repositories | ms | Service rules: ownership, tag limit, mapping |
| Slice | `@WebMvcTest` + `MockMvc` + `jwt()`; `@DataJpaTest` + Testcontainers | 1–3 s each context | Status codes, validation, JSON shape; queries, mappings, migrations |
| Integration | `@SpringBootTest(webEnvironment = RANDOM_PORT)` + `TestRestTemplate` + Testcontainers `@ServiceConnection` | seconds | Register → login → create → list → delete through the real security chain |

```java
@WebMvcTest(BookmarkController.class)
@Import(SecurityConfig.class)
class BookmarkControllerTest {
  @Autowired MockMvc mvc;
  @MockitoBean BookmarkService service;        // Boot 3.4+; @MockBean before that
  @MockitoBean JwtDecoder jwtDecoder;          // the chain needs one; jwt() below bypasses it

  @Test
  void rejectsBlankUrl() throws Exception {
    mvc.perform(post("/bookmarks")
            .with(jwt().jwt(j -> j.subject("42")))
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {"url": "", "title": "x"}
                """))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.errors[0].field").value("url"));
  }

  @Test
  void requiresAuth() throws Exception {
    mvc.perform(get("/bookmarks")).andExpect(status().isUnauthorized());
  }
}
```

Use the test pyramid as the answer to "how did you test it": many unit tests, a slice per controller and repository, a handful of end-to-end flows. Mention that the `@DataJpaTest` runs the Flyway migrations on real Postgres, so the schema is tested too.

## The walkthrough narrative

Five minutes, with a diagram of client → controller → service → repository → Postgres and the security filter chain on the left edge. Then the trade-offs, which are the actual content of the conversation.

1. "It is a bookmarks API: users own bookmarks with tags, authenticated with short-lived JWTs issued by the service itself. Spring Boot 3.5, Java 21, Postgres, Flyway, Testcontainers, Docker."
2. "Requests pass the security chain as a stateless resource server; the JWT subject is the user id and every service method takes it as the first argument, so ownership is enforced in the query, not after loading."
3. "Packages are by feature. Controllers only validate and map; services own transactions; repositories are Spring Data with specifications for filtering and projections for list views."
4. "Errors are Problem Details everywhere, including validation, with a field-level `errors` array."
5. "Tests: unit for rules, slices for the web and JPA layers, a few end-to-end flows through real Postgres. The repository slice runs the migrations, so a bad migration fails CI."

Trade-offs to volunteer before they are asked:

- Self-issued HS256 JWTs instead of sessions or an identity provider: simplest stateless option for one service; I'd move to an IdP with RS256 and a JWK endpoint if a second service needed to verify tokens, and I'd add refresh tokens before shipping to real users.
- 404 instead of 403 for other people's bookmarks: avoids leaking existence; costs some debuggability, mitigated by logging the real reason server-side.
- Offset pagination with a max page size: fine at this scale; keyset pagination on `(created_at, id)` is the upgrade when deep pages or stable infinite scroll matter.
- `@ManyToMany` to tags with a `Set`: adequate because the association has no attributes; the moment it needs "added at", it becomes an explicit join entity.
- Optimistic locking with `@Version` on bookmarks: conflicts are rare and the client can re-read; pessimistic would be wrong here.
- Flyway over `ddl-auto`: the schema is reviewed SQL; Hibernate validates.
- No caching: reads are owner-scoped and cheap; the first cache I'd add is Caffeine on tag counts with eviction on write, not Redis.
- What I'd change next: an outbox and an event when a bookmark is created, a rate limit on login, and OpenAPI generation for the contract.

## Extending the capstone under questioning

Interviewers often take a finished project and ask "what would you change if…". Prepared answers for this service:

| Question | Answer outline |
| --- | --- |
| Ten times more traffic? | Measure first; add read caching for popular bookmarks (Caffeine locally, Redis shared), database indexes on `(user_id, created_at)`, connection pool tuning, horizontal scaling behind a load balancer since the service is stateless |
| Users want full-text search? | Start with PostgreSQL full-text search (`tsvector` column with a GIN index); move to OpenSearch only when ranking or scale demands it |
| Import 50,000 bookmarks at once? | Accept the file, return `202 Accepted` with a job id, process asynchronously in batches, expose job status; idempotency key so retries don't double-import |
| Tags should be shared across users? | Normalise tags into their own table with a join table; unique constraint on the tag name |
| Prevent duplicate bookmarks? | Unique constraint on `(user_id, normalised_url)`; map the constraint violation to `409 Conflict` |
| Audit who changed what? | Domain events on create/update/delete written to an outbox table in the same transaction, published to a log or message broker |

Answering in this shape (what to measure, the simplest change, and when you'd go further) shows judgement rather than a list of technologies.

## Common interview questions

**Why Spring Boot for this?**
Starters and auto-configuration gave me a production-shaped service (security, JPA, Actuator, validation) in a day, and the ecosystem's conventions meant reviewers could read it. The cost is magic I had to learn to see through, which is what the tests and the `--debug` auto-configuration report are for.

**How is a request authenticated?**
`BearerTokenAuthenticationFilter` extracts the JWT, `NimbusJwtDecoder` verifies the HMAC signature and expiry, a converter maps the `roles` claim to authorities, and the `Authentication` goes into the security context. Controllers read the subject with `@AuthenticationPrincipal Jwt`.

**How do you stop one user reading another's bookmark?**
Every query includes `owner_id = :callerId`, so the repository never returns someone else's row; the service maps the empty result to a 404. There is no "load then check" step that could be forgotten.

**What happens on a concurrent update?**
The `@Version` column makes the second `UPDATE` affect zero rows; Hibernate throws an optimistic-lock exception, the handler returns 409 with Problem Details, and the client re-fetches and retries.

**Why Problem Details?**
One error shape for every failure, machine-readable `type` and `status`, extensible with `errors` for validation, standardised by RFC 9457 and supported natively by Spring 6. Clients write one error handler.

**How would you scale it?**
It is stateless, so horizontal scaling is a replica count; the shared state is Postgres. Next steps are read replicas with `readOnly` routing, a cache on hot reads, and a queue for anything slow like link-preview fetching. The connection pool per instance times instances must stay under the DB's limit.

**What did you find hardest?**
The persistence context. Coming from client-side state, the idea that a managed entity writes itself at commit and that lazy loading depends on an open session took a few painful bugs. Turning off open-in-view and returning DTOs made it predictable.

## Pitfalls

- A capstone with more features and fewer tests. Interviewers ask about tests and trade-offs, not feature count.
- Not running it from a clean clone before the interview. Something will be broken.
- A README without curl examples; the hiring manager may actually run it.
- Secrets in `application.yml` in the public repo.
- Not being able to explain one line in your own `SecurityConfig`.

## Key takeaways

- Build the capstone in vertical slices: domain, persistence, API, then tests at each level.
- Be able to reproduce the core code (entity, repository, service, controller, exception handler) from memory.
- Test with unit tests, slice tests (`@WebMvcTest`, `@DataJpaTest`) and one integration test with Testcontainers.
- Narrate design decisions: validation, error format, pagination, transactions.
- Prepare "what if" answers about scale, search, imports and auditing.
