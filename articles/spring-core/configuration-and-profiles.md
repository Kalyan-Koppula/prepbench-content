---
title: Configuration and Profiles
order: 4
summary: application.yml, @ConfigurationProperties, profiles, property precedence, secrets, @ConditionalOn*, and how auto-configuration decides what to create and how to see what it did.
---

Configuration questions check that you can run the same jar in dev, CI and prod, that you know where a property value actually came from, and that you understand auto-configuration well enough to override it or debug why a bean exists (or doesn't).

## `application.yml`

Boot loads `application.properties`/`application.yml` from the classpath (`src/main/resources`), and `application-{profile}.yml` for each active profile. YAML is preferred for nesting; properties for one-liners. Same keys either way.

```yaml
server:
  port: 8080
spring:
  application:
    name: orders
  datasource:
    url: jdbc:postgresql://localhost:5432/orders
    username: orders
    password: ${DB_PASSWORD}                  # placeholder from any property source, incl. env
  jpa:
    open-in-view: false                       # turn this off and be able to say why
acme:
  payments:
    base-url: https://payments.internal
    timeout: 2s                               # Duration binding
    retries: 3
    allowed-currencies: [INR, USD]
```

Keys are relaxed-bound: `acme.payments.base-url`, `acme.payments.baseUrl` and env var `ACME_PAYMENTS_BASEURL` all map to the same property. Env vars can't contain dots or dashes, hence the uppercase-underscore form.

## `@ConfigurationProperties`

Type-safe binding of a prefix onto an object, with validation at startup:

```java
@ConfigurationProperties(prefix = "acme.payments")
@Validated
public record PaymentsProps(
    @NotBlank String baseUrl,
    @DurationMin(millis = 100) Duration timeout,
    @Min(0) @Max(10) int retries,
    List<String> allowedCurrencies) {}

@SpringBootApplication
@ConfigurationPropertiesScan                  // or @EnableConfigurationProperties(PaymentsProps.class)
public class OrdersApplication {}
```

Records bind through the constructor (immutable); classes bind through setters. Nested types, `List`/`Map`, `Duration`, `DataSize`, enums and converters all work. Add `spring-boot-configuration-processor` (optional) to get IDE autocompletion for your keys. Prefer this over scattered `@Value` strings: one typed object per subsystem, injected like any bean, testable with `new PaymentsProps(...)`.

## Profiles

A profile is a named set of beans and properties, activated at runtime:

```yaml
# application.yml
spring:
  profiles:
    group:
      prod: [prod-db, metrics]            # activating prod activates these too
---
spring:
  config:
    activate:
      on-profile: local
  datasource:
    url: jdbc:postgresql://localhost:5432/orders
---
spring:
  config:
    activate:
      on-profile: prod
  datasource:
    url: ${DATABASE_URL}
```

```java
@Profile("!prod")  @Bean  PaymentGateway fakeGateway() { ... }
@Profile("prod")   @Bean  PaymentGateway stripe(PaymentsProps p) { ... }
```

```bash
SPRING_PROFILES_ACTIVE=prod java -jar app.jar
java -jar app.jar --spring.profiles.active=local,debug
```

- No profile active → `default`. Don't ship code that relies on that; set the profile explicitly in every environment.
- `@ActiveProfiles("test")` in tests. Avoid a `test` profile that diverges a lot from prod; prefer Testcontainers so the config is the same.
- Multi-document YAML (`---` + `spring.config.activate.on-profile`) keeps profiles in one file; `application-prod.yml` is the alternative. Profile-specific docs always override the unprofiled one regardless of order.
- Maven profiles are a different thing (build-time); don't mix them up in an answer.

## Property precedence

Later wins. From lowest to highest:

```text
 1. @PropertySource on configuration classes
 2. application.yml inside the jar
 3. application-{profile}.yml inside the jar
 4. application.yml next to the jar (./config/, ./)
 5. application-{profile}.yml next to the jar
 6. spring.config.import files (in the order imported; later imports win)
 7. OS environment variables
 8. Java system properties (-Dserver.port=…)
 9. JNDI, ServletContext/ServletConfig params
10. command-line arguments (--server.port=…)
11. @TestPropertySource / properties attribute of @SpringBootTest (tests only)
```

Short version for interviews: command line beats system properties beats env vars beats profile-specific files beats `application.yml`; external files beat packaged ones. To find where a value came from: `/actuator/env` shows every property source in order with the winning one; `Environment.getProperty()` resolves the same way at runtime; `--debug` logs config file loading.

## Secrets

- Never in `application.yml` committed to git. Placeholders (`${DB_PASSWORD}`) resolved from env vars or mounted files.
- `spring.config.import=optional:configtree:/run/secrets/` turns each file in a directory into a property (Kubernetes/Docker secrets mount this way). `optional:` means don't fail if it's absent.
- Vault/AWS/GCP secret managers via Spring Cloud `spring.config.import=vault://` or `aws-secretsmanager:`.
- Actuator sanitises keys that look like secrets (`password`, `secret`, `key`, `token`, `credentials`) in `/env` and `/configprops`; since Boot 3 you must opt in to showing values at all (`management.endpoint.env.show-values=when-authorized`).
- Rotate without restart: `@RefreshScope` (Spring Cloud) or re-read from a secret manager; plain Boot doesn't hot-reload.

## Conditional beans

Boot's auto-configuration is just `@Configuration` classes guarded by conditions. You use the same annotations for your own optional components:

| Annotation | True when |
|---|---|
| `@ConditionalOnClass(RedisTemplate.class)` | the class is on the classpath (a dependency is present) |
| `@ConditionalOnMissingClass("…")` | it isn't |
| `@ConditionalOnBean(DataSource.class)` | a bean of that type is already defined (ordering-sensitive) |
| `@ConditionalOnMissingBean` | no bean of that type exists yet — the "user override" hook |
| `@ConditionalOnProperty(name = "acme.cache.enabled", havingValue = "true", matchIfMissing = true)` | property matches |
| `@ConditionalOnBooleanProperty("acme.cache.enabled")` | Boot 3.5+ shorthand for `true`/`false` properties |
| `@ConditionalOnWebApplication(type = SERVLET)` | running as a web app |
| `@ConditionalOnExpression("…")` | SpEL; last resort |
| `@Profile("prod")` | profile active (also a condition) |

```java
@Configuration
@ConditionalOnProperty(name = "acme.audit.enabled", havingValue = "true")
public class AuditConfig {
    @Bean
    @ConditionalOnMissingBean
    AuditSink auditSink() { return new LoggingAuditSink(); }
}
```

## How auto-configuration works

1. `@SpringBootApplication` includes `@EnableAutoConfiguration`.
2. At startup Boot reads every `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports` file on the classpath — one list of `@AutoConfiguration` class names per jar (Boot 2.7+; older jars used `spring.factories`).
3. Each class is evaluated **after your own configuration**, so its `@ConditionalOnMissingBean` defers to beans you declared. Declaring a `DataSource`, `ObjectMapper` or `RestClient.Builder` bean replaces Boot's.
4. Classes are ordered with `@AutoConfigureBefore/After/Order`, since one's conditions may depend on another's beans.
5. Disabling: `@SpringBootApplication(exclude = DataSourceAutoConfiguration.class)` or `spring.autoconfigure.exclude=…`.

Boot 4 splits the one big `spring-boot-autoconfigure` jar into per-technology modules (`spring-boot-jpa`, `spring-boot-webmvc`, …) so starters pull in only the auto-configuration they need; the mechanism is the same.

To see what was applied:

```bash
java -jar app.jar --debug          # prints the CONDITIONS EVALUATION REPORT: positive matches, negative matches, exclusions
```

```text
Positive matches:
   DataSourceAutoConfiguration matched:
      - @ConditionalOnClass found required classes 'javax.sql.DataSource', 'org.springframework.jdbc.datasource.embedded.EmbeddedDatabaseType'
Negative matches:
   RedisAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'org.springframework.data.redis.core.RedisOperations'
```

With Actuator, `/actuator/conditions` gives the same report as JSON, `/actuator/beans` lists every bean with its dependencies, and `/actuator/configprops` shows every bound `@ConfigurationProperties`. These three endpoints answer "why is there no X bean" faster than reading source.

Writing your own auto-configuration (for a shared library): a `@AutoConfiguration` class with conditions, listed in the `.imports` file, plus a `@ConfigurationProperties` for its settings. A starter is just a POM depending on it.

## Worked example: typed, validated configuration

```java
@Validated
@ConfigurationProperties(prefix = "payments")
public record PaymentsProperties(
    @NotNull URI baseUrl,
    @NotBlank String apiKey,
    @DurationUnit(ChronoUnit.SECONDS) Duration timeout,
    @Min(0) @Max(5) int maxRetries,
    Map<String, String> merchantIds) {

    public PaymentsProperties {
        if (timeout == null) timeout = Duration.ofSeconds(5); // default
    }
}

@SpringBootApplication
@ConfigurationPropertiesScan
public class ShopApplication { }
```

```yaml
# application.yml (shared defaults)
payments:
  base-url: https://sandbox.payments.example
  timeout: 3
  max-retries: 2
  merchant-ids:
    eu: m-123
    us: m-456

---
spring:
  config:
    activate:
      on-profile: prod
payments:
  base-url: https://api.payments.example
  max-retries: 3
```

And the secret comes from the environment: `PAYMENTS_API_KEY=…` binds to `payments.api-key` through relaxed binding.

What this gives you:

- **Type safety**: `Duration`, `URI` and maps are converted once, at startup.
- **Fail fast**: a missing API key or an out-of-range retry count stops the application at startup with a clear message, instead of failing on the first payment.
- **One place** to see every payment setting, injectable anywhere as a normal bean.
- **Profiles** override only what differs in production.

Avoid scattering `@Value("${payments.timeout}")` through the code: it duplicates keys as strings, can't be validated as a group, and is harder to test.

## Debugging "where did this value come from?"

- `/actuator/env` (secured, and not exposed publicly) lists every property source in precedence order and which one supplied each value.
- `/actuator/configprops` shows bound `@ConfigurationProperties` beans with their final values (secrets masked).
- Starting with `--debug` prints the auto-configuration report: which auto-configurations applied, and which conditions failed for those that didn't.

## Common interview questions

**Where does Spring Boot look for configuration and which source wins?**
Packaged `application.yml` and profile variants, then external files next to the jar, then env vars, system properties and finally command-line args, each overriding the previous. `/actuator/env` lists the sources in order with the resolved value.

**`@Value` vs `@ConfigurationProperties`?**
`@Value` injects one property into one place, as a string expression. `@ConfigurationProperties` binds a whole prefix onto a typed, validated, immutable object you inject and unit-test like any bean, with IDE metadata. Use `@Value` for a single value, properties classes for a subsystem.

**How does auto-configuration decide to create a `DataSource`?**
`DataSourceAutoConfiguration` is `@ConditionalOnClass(DataSource.class)` and creates a Hikari pool `@ConditionalOnMissingBean(DataSource.class)` using `spring.datasource.*`. If you define your own `DataSource` bean, the condition fails and Boot backs off.

**How do you find out why a bean wasn't created?**
Run with `--debug` or open `/actuator/conditions` and read the negative matches: a missing class, a property not set, or a bean of the same type already present. For your own beans, check the package is under the scan root and the profile is active.

**How do profiles interact with properties?**
Profile-specific documents override the base document for the same key, regardless of file order, and multiple active profiles apply in activation order with the last winning. Beans annotated `@Profile` exist only when their profile matches.

**How do you keep secrets out of the repo?**
Reference them with placeholders and supply them at runtime: env vars, mounted secret files via `configtree:`, or a secret manager through `spring.config.import`. Validate presence with `@ConfigurationProperties` + `@NotBlank` so a missing secret fails startup.

**How would you make a library auto-configure itself?**
Ship an `@AutoConfiguration` class guarded by `@ConditionalOnClass`/`@ConditionalOnMissingBean`, register it in `META-INF/spring/…AutoConfiguration.imports`, bind its settings with `@ConfigurationProperties`, and publish a starter POM. Users add one dependency and override any bean they want.

## Pitfalls

- A property in `application.yml` "not working" because an env var with the relaxed-bound name is set on the host. Check `/actuator/env`.
- `@ConditionalOnBean` in a user `@Configuration`: evaluated before auto-configuration runs, so the bean it's waiting for doesn't exist yet. It's for auto-configuration classes.
- `spring.profiles.active` inside a profile-specific file: ignored. Only `spring.profiles.include`/groups work there, and only in the base document.
- Durations without units: `timeout: 2000` is milliseconds unless the field says otherwise; write `2s`.
- YAML booleans and versions: `on`/`yes` become `true`, `1.10` becomes `1.1`; quote them.

## Key takeaways

- Bind related settings into validated `@ConfigurationProperties` records instead of scattered `@Value`s.
- Profiles override defaults per environment; keep the differences small.
- Property precedence: command line and environment variables override files; know the order roughly.
- Secrets come from the environment or a secrets manager, never from committed files.
- Auto-configuration is conditional bean registration; inspect it with the debug report.
