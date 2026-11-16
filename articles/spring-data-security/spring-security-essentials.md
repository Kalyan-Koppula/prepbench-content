---
title: Spring Security Essentials
order: 5
summary: The filter chain, a lambda-style SecurityFilterChain, authentication vs authorization, UserDetailsService and BCrypt, a stateless JWT resource server, method security, CORS/CSRF for APIs, and the misconfigurations interviewers fish for.
---

Spring Security has a reputation for being opaque, so interviewers use it to separate people who copied a config from people who can say what each line does. The model is small: a chain of servlet filters runs before your controller, one of them authenticates the request, one authorises it, and everything else is configuration of those two. Frontend parallel: it is Express middleware with a strict order and a shared `SecurityContext` instead of `req.user`.

## The filter chain

```text
Request
  → DelegatingFilterProxy (servlet filter registered by Boot)
    → FilterChainProxy (picks the first SecurityFilterChain whose matcher accepts the request)
      → SecurityContextHolderFilter      loads/clears the SecurityContext for this thread
      → CorsFilter                       answers preflight, adds CORS headers
      → CsrfFilter                       checks the token on state-changing requests (if enabled)
      → authentication filters           UsernamePasswordAuthenticationFilter (form login),
                                         BearerTokenAuthenticationFilter (JWT), BasicAuthenticationFilter
      → ExceptionTranslationFilter       turns AuthenticationException → 401 entry point,
                                         AccessDeniedException → 403 handler
      → AuthorizationFilter              applies the authorizeHttpRequests rules
  → DispatcherServlet → your controller
```

A successful authentication filter stores an `Authentication` object (principal, credentials, authorities) in `SecurityContextHolder`, a `ThreadLocal` by default. Everything downstream, including `@PreAuthorize` and `@AuthenticationPrincipal`, reads from there. With virtual threads, `ThreadLocal` still works because each request owns its thread for the request's lifetime.

You can have several `SecurityFilterChain` beans with `securityMatcher("/api/**")`, ordered with `@Order`; the first match wins and the others are not consulted.

## The configuration you should be able to write from memory

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

  @Bean
  SecurityFilterChain apiChain(HttpSecurity http) throws Exception {
    http
        .csrf(csrf -> csrf.disable())                      // stateless bearer API: no cookie, no CSRF
        .cors(Customizer.withDefaults())                    // uses the CorsConfigurationSource bean
        .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(auth -> auth
            .requestMatchers(HttpMethod.POST, "/auth/login", "/auth/register").permitAll()
            .requestMatchers("/actuator/health", "/v3/api-docs/**", "/swagger-ui/**").permitAll()
            .requestMatchers("/admin/**").hasRole("ADMIN")
            .anyRequest().authenticated())
        .oauth2ResourceServer(o -> o.jwt(Customizer.withDefaults()))
        .exceptionHandling(e -> e
            .authenticationEntryPoint(new BearerTokenAuthenticationEntryPoint())
            .accessDeniedHandler(new BearerTokenAccessDeniedHandler()));
    return http.build();
  }

  @Bean
  PasswordEncoder passwordEncoder() {
    return PasswordEncoderFactories.createDelegatingPasswordEncoder();   // bcrypt by default, {id} prefixed
  }

  @Bean
  AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
    return config.getAuthenticationManager();                           // for the /auth/login endpoint
  }
}
```

Things to say about it:

- Spring Security 6 is lambda-only; the `.and()` chaining style from 5 is gone. `Customizer.withDefaults()` means "enable with defaults".
- `requestMatchers` rules are evaluated top to bottom, first match wins. Specific before general; `anyRequest()` last and only once.
- `hasRole("ADMIN")` checks for the authority `ROLE_ADMIN`; `hasAuthority("ROLE_ADMIN")` is the same with no prefix magic. Never write `hasRole("ROLE_ADMIN")`.
- In Spring Security 6.x (including 6.5 / Boot 3.5), `requestMatchers(String)` builds an `MvcRequestMatcher` when Spring MVC is on the classpath and an `AntPathRequestMatcher` otherwise; `PathPatternRequestMatcher` becomes the default in Spring Security 7, and you can opt in early on 6.5 by publishing a `PathPatternRequestMatcherBuilderFactoryBean`. Use `requestMatchers(HttpMethod, String)` when the method matters.
- Without this bean, Boot's default chain protects everything with form login and HTTP Basic, and logs a generated password at startup ("Using generated security password"). Seeing that line in a production log is a finding.

## Authentication vs authorization

Authentication: who are you? Produces an `Authentication` with `isAuthenticated() == true` and a set of `GrantedAuthority`. Done by an `AuthenticationManager` (`ProviderManager`) delegating to `AuthenticationProvider`s: `DaoAuthenticationProvider` for username/password (calls your `UserDetailsService` and `PasswordEncoder`), `JwtAuthenticationProvider` for bearer tokens.

Authorization: what may you do? Decided by `AuthorizationManager`s: URL rules in `authorizeHttpRequests`, method rules in `@PreAuthorize`, and domain checks you write.

HTTP mapping: unauthenticated → 401 with `WWW-Authenticate`; authenticated but forbidden → 403. Spring sometimes answers 403 for both when the entry point is missing; the explicit `exceptionHandling` above fixes that for APIs.

## UserDetailsService and passwords

```java
@Service
public class JpaUserDetailsService implements UserDetailsService {
  private final UserRepository users;
  JpaUserDetailsService(UserRepository users) { this.users = users; }

  @Override
  public UserDetails loadUserByUsername(String email) {
    return users.findByEmail(email)
        .map(u -> User.withUsername(u.getEmail())
            .password(u.getPasswordHash())                 // already encoded, e.g. "{bcrypt}$2a$10$…"
            .roles(u.getRoles().toArray(String[]::new))    // adds the ROLE_ prefix
            .build())
        .orElseThrow(() -> new UsernameNotFoundException(email));
  }
}
```

- `UserDetails` is Spring's view of a user: username, hashed password, authorities, flags for locked/expired. Keep it separate from your JPA `User` entity, or implement the interface on a thin adapter.
- Registration: `passwordEncoder.encode(rawPassword)` and store the result; login: the provider calls `matches(raw, stored)`. You never decode a hash.
- BCrypt: adaptive cost (default strength 10, roughly 100 ms; tune to your hardware), salted per password, output includes the salt and cost. The `DelegatingPasswordEncoder` prefixes hashes with `{bcrypt}` so you can migrate algorithms later (Argon2id, scrypt) without a big bang.
- `UsernameNotFoundException` is swallowed into `BadCredentialsException` so responses do not reveal which usernames exist.

## Stateless JWT resource server

Add `spring-boot-starter-oauth2-resource-server`. Two modes:

1. External issuer (Auth0, Keycloak, Cognito): set `spring.security.oauth2.resourceserver.jwt.issuer-uri`, and Boot builds a `JwtDecoder` that fetches the JWK set, verifies the signature and `iss`/`exp`. Nothing else to write.
2. Self-issued (the capstone): you sign tokens with an HMAC secret or an RSA key and verify them with the same material.

```java
@Bean
JwtEncoder jwtEncoder(@Value("${app.jwt.secret}") String secret) {
  var key = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
  return new NimbusJwtEncoder(new ImmutableSecret<>(key));
}

@Bean
JwtDecoder jwtDecoder(@Value("${app.jwt.secret}") String secret) {
  var key = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
  return NimbusJwtDecoder.withSecretKey(key).macAlgorithm(MacAlgorithm.HS256).build();
}

// issuing, inside an AuthService after authenticationManager.authenticate(...) succeeded
public String issue(Authentication auth) {
  var now = Instant.now();
  var claims = JwtClaimsSet.builder()
      .issuer("bookmarks")
      .issuedAt(now)
      .expiresAt(now.plus(15, ChronoUnit.MINUTES))
      .subject(auth.getName())
      .claim("roles", auth.getAuthorities().stream().map(GrantedAuthority::getAuthority).toList())
      .build();
  var header = JwsHeader.with(MacAlgorithm.HS256).build();
  return encoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
}
```

The secret must be at least 256 bits and must come from the environment, never the repo. By default the resource server maps a `scope`/`scp` claim to `SCOPE_x` authorities; to read your `roles` claim as `ROLE_x`:

```java
@Bean
JwtAuthenticationConverter jwtAuthenticationConverter() {
  var authorities = new JwtGrantedAuthoritiesConverter();
  authorities.setAuthoritiesClaimName("roles");
  authorities.setAuthorityPrefix("");          // claim already holds ROLE_USER
  var converter = new JwtAuthenticationConverter();
  converter.setJwtGrantedAuthoritiesConverter(authorities);
  return converter;
}
```

and pass it with `.oauth2ResourceServer(o -> o.jwt(j -> j.jwtAuthenticationConverter(converter)))`. In a controller, `@AuthenticationPrincipal Jwt jwt` gives you the claims; `jwt.getSubject()` is the user.

Trade-offs you must be ready to state: stateless means no server-side revocation, so keep access tokens short-lived (5–15 minutes) and use a refresh token stored server-side (rotated, revocable) for longevity. Put the access token in memory on the client or in an `HttpOnly` cookie, in which case CSRF is back on the table. HS256 is fine for a single service; use RS256/ES256 with a JWK endpoint when other services must verify tokens without sharing the secret.

## Method security

```java
@Service
public class BookmarkService {

  @PreAuthorize("hasRole('ADMIN') or #ownerId == authentication.name")
  public Page<BookmarkSummary> list(String ownerId, Pageable p) { ... }

  @PostAuthorize("returnObject.ownerId == authentication.name")
  public BookmarkResponse get(long id) { ... }

  @PreAuthorize("@bookmarkAuth.canEdit(#id, authentication)")   // delegate to a bean for anything non-trivial
  public void delete(long id) { ... }
}
```

`@EnableMethodSecurity` (Spring Security 6; `prePostEnabled` is true by default) turns these on. They are AOP advices with the same proxy caveats as `@Transactional`: public methods on Spring beans, no self-invocation. Use URL rules for coarse access (is this area authenticated, is it admin-only) and method security for ownership checks that need parameters. `@PreFilter`/`@PostFilter` filter collections and are usually a sign the query should have filtered instead.

## CORS and CSRF for APIs

CSRF exists because browsers attach cookies automatically. If your API authenticates with a bearer token in the `Authorization` header, a cross-site form cannot add that header, so CSRF protection is unnecessary and `csrf.disable()` is correct. If you put the JWT or a session id in a cookie, you need CSRF again: Spring's `CookieCsrfTokenRepository.withHttpOnlyFalse()` with the double-submit pattern, or `SameSite=Strict`/`Lax` cookies plus an origin check.

CORS is enforced by the browser, not a security control for the server; it decides which origins' scripts may read responses. Register one source and let the security chain use it, so preflight `OPTIONS` requests get answered before authentication rejects them:

```java
@Bean
CorsConfigurationSource corsConfigurationSource() {
  var cfg = new CorsConfiguration();
  cfg.setAllowedOrigins(List.of("https://app.example.com"));
  cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
  cfg.setAllowedHeaders(List.of("Authorization", "Content-Type"));
  cfg.setAllowCredentials(true);               // only with explicit origins, never "*"
  var source = new UrlBasedCorsConfigurationSource();
  source.registerCorsConfiguration("/**", cfg);
  return source;
}
```

`@CrossOrigin` on a controller works for MVC but runs after the security filters, which is why preflights fail when CORS is configured only there.

## Common misconfigurations

- `anyRequest().permitAll()` left over from debugging, or a `permitAll` matcher broader than intended (`/api/**`).
- Matcher order: `anyRequest().authenticated()` before the specific rules makes the specific ones unreachable (Spring 6 throws for rules after `anyRequest`, but not for a broad `requestMatchers` before a narrow one).
- `hasRole("ROLE_ADMIN")`: looks for `ROLE_ROLE_ADMIN`.
- Disabling CSRF on an app that uses session cookies because "the tutorial did".
- Storing passwords with `NoOpPasswordEncoder` or SHA-256 without salt.
- Long-lived access tokens with no refresh or revocation, signed with a short secret, or with the `alg` taken from the token header.
- Actuator endpoints exposed (`management.endpoints.web.exposure.include=*`) and unauthenticated; `/actuator/env` and `/actuator/heapdump` leak secrets.
- Returning 403 for missing credentials, so clients cannot tell "log in" from "not allowed".
- Checking ownership in the controller after already loading someone else's data, instead of filtering by owner in the query.
- Trusting `X-Forwarded-*` headers without `server.forward-headers-strategy` set for the proxy you actually run.

## Common interview questions

**How does Spring Security process a request?**
A `FilterChainProxy` picks the matching `SecurityFilterChain` and runs its filters in order: context loading, CORS, CSRF, an authentication filter that populates the `SecurityContextHolder`, exception translation, then `AuthorizationFilter` applying the URL rules. Only then does the request reach the controller.

**Authentication versus authorization in Spring terms?**
Authentication produces an `Authentication` object via an `AuthenticationManager` and its providers; authorization consults `AuthorizationManager`s with that object against URL rules and method annotations. 401 for the first failing, 403 for the second.

**How would you secure a stateless REST API?**
Bearer JWTs verified by the OAuth2 resource server support, `SessionCreationPolicy.STATELESS`, CSRF off, CORS configured for the known frontend origin, short-lived access tokens with a revocable refresh token, roles mapped from a claim, and `@PreAuthorize` for ownership checks.

**How are passwords stored?**
Hashed with BCrypt through a `DelegatingPasswordEncoder`, which prefixes the algorithm id so it can be upgraded later. Registration encodes, login matches; the plaintext is never stored and the hash cannot be reversed.

**What does `UserDetailsService` do?**
It loads a `UserDetails` (username, hashed password, authorities, account flags) by username for `DaoAuthenticationProvider`, which then compares the submitted password with the `PasswordEncoder`. It is a lookup, not an authenticator.

**When is disabling CSRF acceptable?**
When the browser cannot attach credentials automatically, which is the case for a bearer token in the `Authorization` header and no session cookie. With cookie-based auth, keep CSRF on or rely on `SameSite` plus origin checks.

**JWT or server-side sessions?**
Sessions are revocable and simple for a single server-rendered app; JWTs let many services verify identity without a shared session store. JWTs cost you revocation, so pair short expiry with refresh tokens, and avoid putting anything sensitive in the payload because it is only signed, not encrypted.

**What is the difference between `@PreAuthorize` and URL rules?**
URL rules run in the filter chain before any controller code and know only the path, method, and authorities. `@PreAuthorize` runs on the service method with access to its parameters and the return value, so it handles ownership and per-object checks.

## Pitfalls

- Testing with `@WithMockUser` only; also test the 401 and 403 paths and the JWT converter with `jwt().authorities(...)` from `spring-security-test`.
- Putting the JWT secret in `application.yml` and committing it; use an environment variable and fail startup if it is missing.
- Forgetting `OPTIONS` preflights hit the security chain: without the CORS bean they return 401 and the browser reports a CORS error that is really an auth error.
- `SecurityContextHolder` is thread-local: `@Async` work does not see the user unless you set `SecurityContextHolder.setStrategyName(MODE_INHERITABLETHREADLOCAL)` or use `DelegatingSecurityContextExecutor`.
