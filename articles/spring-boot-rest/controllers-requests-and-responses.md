---
title: Controllers, Requests and Responses
order: 2
summary: "@RestController and the mapping annotations, binding path/query/body/header values, ResponseEntity and status codes, content negotiation, DTOs vs entities, records as DTOs, @ResponseStatus."
---

You know REST design; this is the Spring vocabulary for expressing it, and the handful of decisions (DTO vs entity, `ResponseEntity` vs plain return, where the status comes from) that interviewers use to judge whether you've built real APIs in Spring.

## Express to Spring MVC

| Express | Spring MVC |
|---|---|
| `router.get('/users/:id', handler)` | `@GetMapping("/users/{id}")` method in a `@RestController` |
| `req.params.id` | `@PathVariable long id` |
| `req.query.page` | `@RequestParam(defaultValue = "0") int page` |
| `req.body` (after `express.json()`) | `@RequestBody CreateUser body` (Jackson) |
| `req.headers['x-tenant']` | `@RequestHeader("X-Tenant") String tenant` |
| `res.status(201).json(obj)` | `return ResponseEntity.status(CREATED).body(obj)` or `@ResponseStatus(CREATED)` |
| `res.set('Location', url)` | `ResponseEntity.created(uri).body(obj)` |
| `next(err)` → error middleware | throw → `@ControllerAdvice` |
| middleware | `Filter` / `HandlerInterceptor` |

## A controller

```java
@RestController                           // @Controller + @ResponseBody: return values become the body
@RequestMapping("/api/users")
public class UserController {
    private final UserService users;
    public UserController(UserService users) { this.users = users; }

    @GetMapping("/{id}")
    public UserResponse get(@PathVariable long id) {
        return UserResponse.from(users.get(id));          // 200; service throws NotFoundException → 404 via advice
    }

    @GetMapping
    public List<UserResponse> list(@RequestParam(defaultValue = "") String q,
                                   @RequestParam(required = false) Status status) {
        return users.search(q, status).stream().map(UserResponse::from).toList();
    }

    @PostMapping
    public ResponseEntity<UserResponse> create(@Valid @RequestBody CreateUserRequest req) {
        User u = users.create(req.email(), req.name());
        URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").build(u.id());
        return ResponseEntity.created(location).body(UserResponse.from(u));      // 201 + Location
    }

    @PutMapping("/{id}")
    public UserResponse replace(@PathVariable long id, @Valid @RequestBody UpdateUserRequest req) { ... }

    @PatchMapping(path = "/{id}", consumes = "application/merge-patch+json")
    public UserResponse patch(@PathVariable long id, @RequestBody JsonNode patch) { ... }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)   // 204 with an empty body
    public void delete(@PathVariable long id) { users.delete(id); }
}
```

`@GetMapping` etc. are `@RequestMapping(method = …)` shorthands. Class-level `@RequestMapping` prefixes every method. Paths match exactly by default; since Spring 6 the trailing-slash match is off (`/users/` ≠ `/users`).

## Binding

| Annotation | Source | Notes |
|---|---|---|
| `@PathVariable` | URI template | converted by type (`long`, `UUID`, enums, `LocalDate` with `@DateTimeFormat`) |
| `@RequestParam` | query string / form fields | `required = true` by default → 400 if missing; use `Optional<T>`, `defaultValue` or `required = false`; `List<String> tags` binds `?tags=a&tags=b` or `?tags=a,b` |
| `@RequestBody` | request body via message converter | one per method; `@Valid` to validate; missing/invalid JSON → 400 `HttpMessageNotReadableException` |
| `@RequestHeader` | header | `@RequestHeader HttpHeaders all` for everything |
| `@CookieValue` | cookie | |
| `@ModelAttribute` (or no annotation on a non-simple type) | query/form fields bound onto an object | the way to bind a filter object: `GET /orders?status=PAID&from=2026-01-01` → `OrderFilter` record |
| `@AuthenticationPrincipal` | Spring Security principal | `Jwt`, `UserDetails` |
| `HttpServletRequest`, `Principal`, `Locale`, `UriComponentsBuilder` | injected by type | |

Parameter names (`@PathVariable long id` without `("id")`) require the class to be compiled with `-parameters`; the Boot parent sets it, Gradle's Boot plugin too. With plain Maven and no flag you'll get `IllegalArgumentException: Name for argument of type [long] not specified` on Spring 6.1+ — a classic.

Records as request DTOs:

```java
public record CreateUserRequest(
    @NotBlank @Email String email,
    @NotBlank @Size(max = 100) String name,
    @Nullable String referralCode) {}
```

Jackson binds through the canonical constructor; Bean Validation annotations on components work. Immutable, no Lombok, `equals` for free.

## Responses and status codes

Three ways to set the status; pick one convention per codebase:

```java
@GetMapping("/{id}") public UserResponse get(...)                  // 200 implicitly; 204 only if the method returns void
@PostMapping @ResponseStatus(HttpStatus.CREATED) public UserResponse create(...)   // fixed status, plain return
@PostMapping public ResponseEntity<UserResponse> create(...)         // dynamic status, headers, Location
```

`ResponseEntity` when you need headers, a conditional status (`200` vs `201` on upsert) or `ResponseEntity.notFound().build()` style; otherwise plain return + exceptions is cleaner. Return `Optional` from a service and map it: `users.find(id).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build())`, or throw and let the advice map it.

Status cheat sheet as Spring produces it: 200 default, 201 for create with `Location`, 204 for delete/no body, 400 for binding/validation errors, 401/403 from security, 404 for no handler or your not-found exception, 405 wrong method, 406 no acceptable representation, 409 conflict (`DataIntegrityViolationException` or optimistic-lock failure, mapped by you), 415 unsupported `Content-Type`, 422 if you distinguish semantic validation from syntax, 500 for everything unhandled.

Other return types: `ResponseEntity<StreamingResponseBody>` or `ResponseBodyEmitter`/`SseEmitter` for streaming, `CompletableFuture<T>`/`Callable<T>` to release the Tomcat thread while the work runs elsewhere (servlet async), `ProblemDetail` for errors.

## Content negotiation

Spring picks the message converter from the request's `Accept` header against what the handler `produces` (if set) and the converters available. JSON is the default when Jackson is present; XML needs `jackson-dataformat-xml`. `consumes` restricts the request `Content-Type` (415 otherwise). Query-parameter negotiation (`?format=xml`) is off by default; path-extension negotiation was removed. For versioning via media type, see the versioning article.

```java
@GetMapping(path = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
@PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
```

## DTOs vs entities

Return and accept **DTOs**, never JPA entities. The reasons you should be able to list:

- Entities expose the schema; every column rename becomes an API change, and lazy relations serialise unpredictably (`LazyInitializationException`, infinite recursion, or N+1 selects with `open-in-view`).
- Binding a request body straight onto an entity lets clients set any field — mass assignment (`"isAdmin": true`, `"id": 7`).
- Validation rules differ per operation (create vs update vs patch); entities can hold only one set.
- DTOs let the API shape be designed for the client (nested, flattened, computed) rather than for the database.

Map explicitly (a static `from(User)` method, or MapStruct for large codebases). Response and request DTOs are usually separate types, both records. Keep `Optional` out of DTOs; use `@Nullable` or absent fields with `NON_NULL` inclusion. Enumerations serialise by name; fine, but freeze the names.

## Worked example: a complete resource

```java
@RestController
@RequestMapping("/api/projects")
class ProjectController {
    private final ProjectService projects;

    ProjectController(ProjectService projects) { this.projects = projects; }

    @GetMapping
    Page<ProjectSummary> list(@RequestParam(required = false) String q,
                              @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable page) {
        return projects.search(q, page); // 200 with a page of DTOs
    }

    @GetMapping("/{id}")
    ProjectDetails get(@PathVariable UUID id) {
        return projects.get(id); // throws NotFoundException → 404 via the exception handler
    }

    @PostMapping
    ResponseEntity<ProjectDetails> create(@Valid @RequestBody CreateProject body, UriComponentsBuilder uri) {
        ProjectDetails created = projects.create(body);
        URI location = uri.path("/api/projects/{id}").buildAndExpand(created.id()).toUri();
        return ResponseEntity.created(location).body(created); // 201 + Location header
    }

    @PatchMapping("/{id}")
    ProjectDetails rename(@PathVariable UUID id, @Valid @RequestBody RenameProject body) {
        return projects.rename(id, body.name()); // 200 with the updated resource
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void delete(@PathVariable UUID id) {
        projects.delete(id); // 204, idempotent: deleting twice is still 204 (or 404 by policy)
    }
}

record CreateProject(@NotBlank @Size(max = 80) String name, @Size(max = 500) String description) {}
record RenameProject(@NotBlank @Size(max = 80) String name) {}
record ProjectSummary(UUID id, String name, Instant createdAt) {}
record ProjectDetails(UUID id, String name, String description, Instant createdAt, int memberCount) {}
```

The request for `POST /api/projects` flows through: the servlet container → `DispatcherServlet` → handler mapping picks `create` → the `@RequestBody` is read by Jackson's message converter → `@Valid` runs Bean Validation (failure: 400 before the method runs) → the method executes → the return value is written as JSON with status 201 and a `Location` header.

Design points to mention: plural resource nouns, DTOs in and out (never entities), `201` with `Location` for creation, `204` for deletion, `PATCH` for partial updates, pagination by default on collections, and errors handled centrally rather than in each method.

## Common interview questions

**`@Controller` vs `@RestController`?**
`@RestController` is `@Controller` plus `@ResponseBody` on every method: return values are written through a message converter as the response body rather than treated as a view name. For a JSON API you always want the latter.

**When do you return `ResponseEntity` versus a plain object?**
`ResponseEntity` when the status or headers vary per call (201 with `Location`, 204, conditional 304, downloads). Plain return with `@ResponseStatus` and exceptions for the common case; it keeps signatures readable and tests simpler.

**How do you bind a filter with ten optional query parameters?**
Declare a record or class and take it as an un-annotated (or `@ModelAttribute`) parameter; Spring binds each query key to the matching component. Validation annotations and `@DateTimeFormat` work on it like a body.

**Why not return JPA entities from controllers?**
Schema leakage, lazy-loading and recursion issues at serialisation time, mass-assignment risk on input, and inability to shape or version the API independently of the database. Map to request/response records.

**What status does Spring send for a malformed JSON body, and for a missing required query param?**
Both are 400: `HttpMessageNotReadableException` and `MissingServletRequestParameterException`, via `DefaultHandlerExceptionResolver`. A `@ControllerAdvice` extending `ResponseEntityExceptionHandler` can give them a consistent body.

**How is `PUT` vs `PATCH` handled?**
`PUT` replaces: bind a full DTO and validate it completely. `PATCH` is partial: bind to a DTO with all-optional fields and distinguish "absent" from "null" (JSON Merge Patch with `JsonNode`, or `Optional`/`JsonNullable` fields), then apply only what was sent.

**What is `-parameters` and why does Spring care?**
A `javac` flag that keeps method parameter names in the class file. Spring 6.1+ uses them to match `@PathVariable`/`@RequestParam` without explicit names; without the flag you must write `@PathVariable("id")`. Boot's build plugins set it.

**How would you return a file or a large result without buffering it?**
Return `ResponseEntity<Resource>` or `StreamingResponseBody` with the right `Content-Type` and `Content-Disposition`; for a huge JSON list stream a `Stream<T>` from the repository inside a read-only transaction, or paginate.

## Pitfalls

- `@RequestParam int page` with no default: 400 when absent, and `null` can't bind to a primitive.
- `@PathVariable String id` with a dot in the value (`v1.2`): fine since Spring 5.3 suffix matching is off, but check older code.
- Two `@RequestBody` parameters on one method: the body can only be read once. Wrap in one DTO.
- Returning `Map<String, Object>` from controllers to avoid writing a DTO: no types, no validation, no docs.
- Mixing `@ResponseStatus` and `ResponseEntity` on the same method: the entity's status wins and the annotation misleads readers.

## Key takeaways

- Controllers map HTTP to method calls; keep them thin and delegate to services.
- Bind with `@PathVariable`, `@RequestParam`, `@RequestBody` and validate with `@Valid`.
- Return DTOs, not entities; use records for request and response shapes.
- Use correct status codes: 200, 201 with `Location`, 204, 400, 404, 409.
- Handle errors in one `@RestControllerAdvice` with Problem Details.
