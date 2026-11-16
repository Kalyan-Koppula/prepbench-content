---
title: Validation and Error Handling
order: 3
summary: Bean Validation with @Valid, constraints, groups and custom validators; @ControllerAdvice and @ExceptionHandler; RFC 9457 Problem Details in Boot 3; one consistent error shape that never leaks internals.
---

Interviewers ask "how do you handle errors in your API?" and want one coherent story: validate input declaratively at the edge, throw domain exceptions in services, translate everything to a single error format in one place, and never let a stack trace or SQL out. Spring gives you each piece; your job is to assemble them and know the exception names.

## Bean Validation

Add `spring-boot-starter-validation` (Hibernate Validator, the reference implementation of Jakarta Bean Validation; it's not in the web starter since Boot 2.3). Annotate DTOs; trigger with `@Valid`.

```java
public record CreateOrderRequest(
    @NotNull Long customerId,
    @NotEmpty List<@Valid LineRequest> lines,        // cascade into elements
    @Size(max = 500) String note,
    @Future LocalDate deliverBy,
    @Pattern(regexp = "[A-Z]{3}") String currency) {}

public record LineRequest(@NotBlank String sku, @Positive @Max(1000) int quantity) {}

@PostMapping
public OrderResponse create(@Valid @RequestBody CreateOrderRequest req) { ... }
```

Constraints you should know by name: `@NotNull`, `@NotBlank` (strings: not null and has non-whitespace), `@NotEmpty` (collections/strings: not null, size > 0), `@Size`, `@Min`/`@Max`, `@Positive`/`@PositiveOrZero`, `@Email`, `@Pattern`, `@Past`/`@Future`, `@Digits`, `@AssertTrue`. Hibernate extras: `@URL`, `@Length`, `@Range`, `@DurationMin`. Every one has a `message` attribute (`"{jakarta.validation.constraints.NotBlank.message}"` by default, overridable in `ValidationMessages.properties`).

What triggers validation where:

| Where | Trigger | Exception on failure |
|---|---|---|
| `@RequestBody` / `@ModelAttribute` | `@Valid` or `@Validated` on the parameter | `MethodArgumentNotValidException` → 400 |
| `@RequestParam` / `@PathVariable` constraints (`@Min(1) @PathVariable long id`) | automatic since Spring 6.1 when a constraint is present | `HandlerMethodValidationException` → 400 |
| any bean's method parameters / return | `@Validated` on the **class** + constraints on the method | `ConstraintViolationException` (not an MVC exception; map it yourself) |
| manual | `Validator.validate(obj)` | returns a `Set<ConstraintViolation<T>>` |

`@Valid` (Jakarta) cascades and validates; `@Validated` (Spring) additionally supports groups and enables method validation on classes.

### Groups

Different rules for create and update on one DTO:

```java
public interface OnCreate {}
public interface OnUpdate {}

public record UserRequest(
    @Null(groups = OnCreate.class) @NotNull(groups = OnUpdate.class) Long id,
    @NotBlank(groups = {OnCreate.class, OnUpdate.class}) String name) {}

@PostMapping public UserResponse create(@Validated(OnCreate.class) @RequestBody UserRequest r) { ... }
@PutMapping  public UserResponse update(@Validated(OnUpdate.class) @RequestBody UserRequest r) { ... }
```

Most teams prefer separate request records over groups; know groups exist and why you'd avoid them.

### Custom validators

```java
@Target({FIELD, PARAMETER, RECORD_COMPONENT})
@Retention(RUNTIME)
@Constraint(validatedBy = IsoCurrencyValidator.class)
public @interface IsoCurrency {
    String message() default "must be an ISO 4217 currency code";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

public class IsoCurrencyValidator implements ConstraintValidator<IsoCurrency, String> {
    @Override
    public boolean isValid(String value, ConstraintValidatorContext ctx) {
        if (value == null) return true;          // leave null to @NotNull; constraints compose
        try { Currency.getInstance(value); return true; } catch (IllegalArgumentException e) { return false; }
    }
}
```

Validators are Spring beans, so you can inject a repository for "email not already registered" — but uniqueness is a race unless the DB enforces it; validate for a nice message and rely on the unique constraint for correctness. Cross-field rules (`from < to`) go in a class-level constraint or a `@AssertTrue` method on the record.

## Exceptions in the service layer

Throw unchecked domain exceptions with the information needed to build a response, and nothing HTTP-specific:

```java
public class NotFoundException extends RuntimeException {
    public NotFoundException(String type, Object id) { super(type + " " + id + " not found"); }
}
public class ConflictException extends RuntimeException { ... }
```

Alternatives for quick cases: `throw new ResponseStatusException(HttpStatus.NOT_FOUND, "order not found")` from a controller, or Spring 6's `ErrorResponseException` which already carries a `ProblemDetail`. Keep HTTP types out of services where the service is reused by messaging or jobs.

## `@ControllerAdvice` and Problem Details

RFC 9457 (which obsoletes 7807) defines `application/problem+json`: `type`, `title`, `status`, `detail`, `instance`, plus any extension fields. Spring 6 / Boot 3 implements it natively with `ProblemDetail` and `ResponseEntityExceptionHandler`.

```yaml
spring:
  mvc:
    problemdetails:
      enabled: true      # Spring MVC's own exceptions (400/404/405/415…) become problem+json automatically
```

One advice to translate everything else:

```java
@RestControllerAdvice
public class ApiExceptionHandler extends ResponseEntityExceptionHandler {

    @ExceptionHandler(NotFoundException.class)
    ProblemDetail notFound(NotFoundException ex) {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        pd.setType(URI.create("https://api.acme.com/problems/not-found"));
        return pd;
    }

    @ExceptionHandler({DataIntegrityViolationException.class, ConflictException.class})
    ProblemDetail conflict(Exception ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, "the resource conflicts with existing data");
    }

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(MethodArgumentNotValidException ex,
            HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        ProblemDetail pd = ex.getBody();                          // already 400 with a title
        pd.setDetail("validation failed");
        pd.setProperty("errors", ex.getBindingResult().getFieldErrors().stream()
            .map(f -> Map.of("field", f.getField(), "message", String.valueOf(f.getDefaultMessage())))
            .toList());
        return handleExceptionInternal(ex, pd, headers, status, request);
    }

    @ExceptionHandler(Exception.class)
    ProblemDetail unexpected(Exception ex, HttpServletRequest req) {
        log.error("unhandled on {} {}", req.getMethod(), req.getRequestURI(), ex);   // log here, with stack
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, "unexpected error");
        pd.setProperty("requestId", MDC.get("requestId"));                             // so support can find the log
        return pd;
    }
}
```

```json
{
  "type": "https://api.acme.com/problems/validation",
  "title": "Bad Request",
  "status": 400,
  "detail": "validation failed",
  "instance": "/api/orders",
  "errors": [ { "field": "lines[0].quantity", "message": "must be greater than 0" } ],
  "requestId": "6f1c…"
}
```

- `@RestControllerAdvice` = `@ControllerAdvice` + `@ResponseBody`. Scope it with `basePackages` or `assignableTypes` if you have several.
- Returning `ProblemDetail` sets `Content-Type: application/problem+json` automatically.
- Handler resolution picks the most specific exception type across all advices; order advices with `@Order` if they overlap.
- Extending `ResponseEntityExceptionHandler` gives you overridable hooks for all of Spring MVC's exceptions (binding, missing params, unsupported media type, no handler, async timeout).
- `@ExceptionHandler` inside a controller handles only that controller; the advice is global.

## Consistent and safe

The rules for the error shape:

1. One format for every error, including 401/403 from security and 404s from Boot's `/error` — customise `AuthenticationEntryPoint`, `AccessDeniedHandler` and (if needed) `ErrorController` so clients parse one shape.
2. `detail` is for humans, safe to show; machine-readable `type` and extension fields are for clients. Don't make clients parse messages.
3. Never leak: exception class names, stack traces, SQL, table names, file paths, internal hostnames, or which of "user doesn't exist" vs "wrong password" failed. Boot's defaults already hide message and trace (`server.error.include-message=never`); keep them.
4. Log the full exception once, at the point you convert it, with the request id; return the request id in the response.
5. Validation errors list every field, not just the first; 400 for syntax/shape, optionally 422 for semantically invalid, 409 for state conflicts.
6. Don't catch `Exception` in services to "handle" it; let it reach the advice.

## Common interview questions

**How do you validate incoming requests?**
Bean Validation annotations on request records, `@Valid` on the `@RequestBody`, cascading into nested lists; constraints on path and query params are validated automatically since Spring 6.1. Failures become 400s with a field-level error list from one `@ControllerAdvice`.

**`@Valid` vs `@Validated`?**
`@Valid` is the Jakarta annotation: validate this object and cascade. `@Validated` is Spring's: supports validation groups, and on a class it enables method-level validation of parameters and return values via an AOP proxy.

**What is Problem Details and why use it?**
RFC 9457's standard JSON error body — `type`, `title`, `status`, `detail`, `instance` plus extensions — served as `application/problem+json`. Spring 6 has `ProblemDetail` and can emit it for all framework exceptions, so clients get one documented error shape instead of per-endpoint improvisation.

**How do you make sure stack traces never reach the client?**
A catch-all `@ExceptionHandler(Exception.class)` that logs with the stack and returns a generic 500 body with a request id; keep Boot's `include-stacktrace=never`; return domain messages only for exceptions you designed to be client-facing.

**Where should validation live — controller, service or entity?**
Shape and format at the edge with Bean Validation; business rules in the service/domain (`throw new ConflictException`) because they need data and run for non-HTTP callers too; database constraints as the last line. Each layer rejects what only it can know.

**Why can't a `@ControllerAdvice` handle exceptions from a security filter?**
Filters run before `DispatcherServlet`, and advices are part of MVC's exception resolution, so the exception never reaches them. Security exposes `AuthenticationEntryPoint` and `AccessDeniedHandler` for that; you can also reuse the same `ProblemDetail` writer there.

**How would you validate that an email is unique?**
Give a friendly early check in a custom validator or service lookup, but enforce it with a unique index and map `DataIntegrityViolationException` to 409 — two requests can pass the check simultaneously, only the database can arbitrate.

## Pitfalls

- Forgetting `@Valid` on the parameter: annotations on the DTO do nothing.
- `@NotNull` on an `int`: never fails (primitives can't be null); use a wrapper or `@Min`.
- Validating a `List<Item>` body with `@Valid` but no `@Valid` on the element: the list is validated, the items aren't; use `List<@Valid Item>`.
- Putting `@Validated` on the controller and getting `ConstraintViolationException` (500 by default) instead of the 400 MVC path: either handle it in the advice or drop the class annotation on Spring 6.1+.
- Returning the `ex.getMessage()` of a `DataIntegrityViolationException`: it contains the SQL and constraint name.
