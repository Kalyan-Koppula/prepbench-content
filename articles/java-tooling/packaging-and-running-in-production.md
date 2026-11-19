---
title: Packaging and Running in Production
order: 5
summary: The Boot JAR, a multi-stage layered Dockerfile, JVM flags inside containers, health probes, graceful shutdown, environment-based config and the 12-factor mapping.
---

"How do you deploy this?" ends many backend interviews. The expected answer is a Boot jar in a container, built in layers, with JVM memory set from the container limit, liveness/readiness probes wired to Actuator, graceful shutdown, and all config coming from the environment. Here is each piece, with the commands.

## The Boot jar

```bash
mvn clean package                      # target/orders-service-0.1.0.jar (executable) + the .original plain jar
java -jar target/orders-service-0.1.0.jar
java -jar app.jar --spring.profiles.active=prod --server.port=8080
```

`spring-boot-maven-plugin:repackage` wraps the plain jar with a launcher and nests the dependencies (see the classpath article). The WAR option still exists for old app servers; nobody asks for it any more. A Boot jar can also be built into an OCI image **without a Dockerfile** by Cloud Native Buildpacks: `mvn spring-boot:build-image` (needs Docker running; produces a sane, layered image with a memory calculator). Many teams still prefer a Dockerfile for control, so know both.

## Layered jars and a multi-stage Dockerfile

A fat jar changes on every build, so every image push uploads 60 MB even when only your classes changed. Boot's layered jar splits the content into layers in order of how often they change:

```text
dependencies            (third-party release jars)       changes rarely
spring-boot-loader      (launcher)                        changes with Boot
snapshot-dependencies   (-SNAPSHOT jars)                  changes often
application             (BOOT-INF/classes, resources)     changes every build
```

Extract them in the build stage and `COPY` them as separate Docker layers so the registry and the nodes cache the unchanged ones:

```text
# syntax=docker/dockerfile:1
FROM eclipse-temurin:21-jdk AS build
WORKDIR /src
COPY mvnw pom.xml ./
COPY .mvn .mvn
RUN --mount=type=cache,target=/root/.m2 ./mvnw -q dependency:go-offline
COPY src src
RUN --mount=type=cache,target=/root/.m2 ./mvnw -q -DskipTests package && cp target/*.jar app.jar
RUN java -Djarmode=tools -jar app.jar extract --layers --destination extracted

FROM eclipse-temurin:21-jre AS runtime
WORKDIR /app
RUN useradd --system --uid 1001 app
COPY --from=build /src/extracted/dependencies/ ./
COPY --from=build /src/extracted/spring-boot-loader/ ./
COPY --from=build /src/extracted/snapshot-dependencies/ ./
COPY --from=build /src/extracted/application/ ./
USER app
EXPOSE 8080
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75.0 -XX:+ExitOnOutOfMemoryError"
ENTRYPOINT ["java", "-jar", "app.jar"]
```

Points to make when walking an interviewer through it:

- Two stages: a JDK to build, a JRE (or `jlink`ed runtime, or a distroless image) to run. The image never contains Maven, sources or tests.
- The `.m2` cache mount and copying `pom.xml` before `src` mean dependencies are only re-downloaded when the POM changes.
- Dependencies layer is copied first; the application layer last. Rebuilds push one small layer.
- Non-root user, pinned base image tag (ideally a digest), no `latest`.
- `exec`-form `ENTRYPOINT` so the JVM is PID 1 and receives `SIGTERM` directly (a shell wrapper would swallow it unless it `exec`s).
- `-Djarmode=tools … extract --layers` is Boot 3.3+; older projects use `-Djarmode=layertools extract`. Alternatively `extract` without `--layers` yields an exploded layout where `java -jar` starts faster because it doesn't read nested jars.
- Optional: an AppCDS archive (`-XX:SharedArchiveFile`) or Boot's `--training-run` with Java 24 AOT cache to cut startup; mention, don't dwell.

## JVM flags in containers

The JVM has read cgroup limits since Java 10, so `Runtime.availableProcessors()` and the default heap respect the container. Defaults are still conservative: max heap defaults to **25%** of the container memory.

| Flag | Why |
|---|---|
| `-XX:MaxRAMPercentage=75.0` | use most of the limit for heap; the rest is metaspace, thread stacks, direct byte buffers, JIT code cache and the OS. Set `InitialRAMPercentage` equal to avoid growing |
| `-XX:+ExitOnOutOfMemoryError` | an OOM in one thread leaves the app half-alive; exit so Kubernetes restarts it |
| `-XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/dumps` | with a mounted volume; otherwise the dump dies with the pod |
| `-XX:+UseZGC` / default G1 | ZGC for latency-sensitive services with large heaps; G1 is fine for most APIs |
| `-XX:ActiveProcessorCount=2` | override when the CPU quota is fractional and the JVM sees 1 CPU (which makes it pick SerialGC and fewer JIT threads) |
| `-Xss` | lower if you run thousands of platform threads; irrelevant with virtual threads |

Put them in `JAVA_TOOL_OPTIONS` (the JVM reads it automatically and prints `Picked up JAVA_TOOL_OPTIONS:`), which lets the deployment manifest tune them without rebuilding the image.

Kubernetes side: set `resources.requests` and `limits` for memory **equal** (so the pod is never evicted for using what the JVM was told it could use); exit code 137 means the kernel OOM-killed the container, which is a sizing error, not a Java `OutOfMemoryError`.

## Health checks

Add `spring-boot-starter-actuator`. Boot exposes `/actuator/health` and, when it detects Kubernetes (or when `management.endpoint.health.probes.enabled=true`), separate liveness and readiness groups:

```yaml
management:
  endpoint:
    health:
      probes:
        enabled: true
      show-details: never          # don't expose DB hostnames to the internet
  endpoints:
    web:
      exposure:
        include: health, info, metrics, prometheus
  server:
    port: 9090                      # management on a separate port, not routed by the ingress
```

```text
livenessProbe:  GET /actuator/health/liveness   → "is the process wedged? restart it"
readinessProbe: GET /actuator/health/readiness  → "can it take traffic? otherwise pull it from the Service"
startupProbe:   same URL as liveness, with a long failureThreshold for slow-starting JVMs
```

Readiness includes `ApplicationAvailability` state and, by default, nothing else; adding the DB to readiness means a DB blip takes all your pods out of rotation at once — usually a bad idea. Liveness must **never** depend on external systems, or a downstream outage causes a restart storm. Custom checks implement `HealthIndicator` and are grouped with `management.endpoint.health.group.readiness.include=readinessState,cache`.

## Graceful shutdown

On `SIGTERM`, Kubernetes removes the pod from endpoints and waits `terminationGracePeriodSeconds` (30 s default) before `SIGKILL`. Boot needs to stop accepting new requests, finish in-flight ones, then close pools:

```yaml
server:
  shutdown: graceful                  # the default since Boot 3.4; immediate before that
spring:
  lifecycle:
    timeout-per-shutdown-phase: 20s   # less than the k8s grace period
```

Sequence: readiness goes `REFUSING_TRAFFIC` → Tomcat stops accepting connections → active requests get up to the timeout → `@PreDestroy`/`SmartLifecycle.stop` close the Hikari pool, Kafka consumers, schedulers. A `preStop` sleep of a few seconds in the pod spec covers the window where the endpoint update hasn't reached every kube-proxy yet. In-flight messages and scheduled jobs need the same courtesy: make consumers idempotent and let jobs checkpoint.

## Environment-based config

Same jar, every environment. Config comes from outside, in Spring's precedence order (command line > Java system properties > OS environment > `application-{profile}.yml` > `application.yml`):

```bash
SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/orders     # relaxed binding: spring.datasource.url
SPRING_PROFILES_ACTIVE=prod
SPRING_CONFIG_IMPORT=optional:configtree:/run/secrets/     # each file under the dir becomes a property
```

- Secrets: mounted files (`configtree:`), Vault (`spring-cloud-starter-vault-config`), or cloud secret managers via `spring.config.import`. Never bake into the image or commit `application-prod.yml` with passwords.
- `spring.config.import=optional:file:/config/override.yml` lets a ConfigMap mount override anything.
- `@ConfigurationProperties` with `@Validated` fails startup when a required value is missing — fail at deploy, not at the first request.
- Expose `/actuator/env` and `/actuator/configprops` only on the internal management port, and sanitised.

## 12-factor mapping

| Factor | In a Boot service |
|---|---|
| Codebase, dependencies | one repo per service; all deps declared in the POM, nothing from the host |
| Config | environment variables, `spring.config.import`, profiles; same artifact everywhere |
| Backing services | DB/queue URLs are config; swap Postgres for a Testcontainer with one property |
| Build, release, run | `mvn package` → image + env = release → `java -jar` |
| Processes | stateless; sessions in Redis (`spring-session`) or JWT, uploads to object storage |
| Port binding | embedded Tomcat on `server.port`; no app server |
| Concurrency | scale out with replicas; inside, thread pool or virtual threads |
| Disposability | fast startup (lazy init, AOT/CDS), graceful shutdown, idempotent consumers |
| Dev/prod parity | Testcontainers and Docker Compose support (`spring-boot-docker-compose`) for local |
| Logs | write to stdout as JSON; the platform ships them |
| Admin processes | Flyway/Liquibase migrations on startup or a one-off job; Actuator for inspection |

## Worked example: a production-ready container, end to end

```dockerfile
# Build stage
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN ./mvnw -q dependency:go-offline        # cached layer: dependencies change rarely
COPY src src
RUN ./mvnw -q package -DskipTests && \
    java -Djarmode=tools -jar target/app.jar extract --layers --launcher --destination extracted

# Runtime stage
FROM eclipse-temurin:21-jre
RUN useradd --system --uid 1001 app
USER app
WORKDIR /app
COPY --from=build /app/extracted/dependencies/ ./
COPY --from=build /app/extracted/spring-boot-loader/ ./
COPY --from=build /app/extracted/snapshot-dependencies/ ./
COPY --from=build /app/extracted/application/ ./
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75 -XX:+ExitOnOutOfMemoryError"
EXPOSE 8080
ENTRYPOINT ["java", "org.springframework.boot.loader.launch.JarLauncher"]
```

With matching application settings:

```yaml
server:
  shutdown: graceful                 # finish in-flight requests on SIGTERM
spring:
  lifecycle:
    timeout-per-shutdown-phase: 20s
management:
  endpoint:
    health:
      probes:
        enabled: true                # /actuator/health/liveness and /readiness
```

Why each choice:

| Choice | Benefit |
| --- | --- |
| Multi-stage build, JRE runtime image | Small image without build tools |
| Layered extraction | Dependency layers are cached; a code change only rebuilds the small application layer |
| Non-root user | Limits damage if the process is compromised |
| `MaxRAMPercentage` | Heap scales with the container's memory limit |
| `ExitOnOutOfMemoryError` | A broken JVM exits so the orchestrator restarts it, instead of limping |
| Graceful shutdown and probes | Rolling deploys without dropped requests; traffic only reaches ready instances |

Configuration and secrets come from the environment (environment variables, mounted files, a secrets manager), never from the image, so the same image runs in every environment.

## Common interview questions

**Walk me through how your service goes from a commit to running in production.**
CI runs `mvn verify` (unit + Testcontainers ITs), builds a layered image with a multi-stage Dockerfile, scans and pushes it tagged with the commit SHA; CD applies a manifest that sets env vars, resource limits, probes and the grace period; Boot starts, runs Flyway, flips readiness, and takes traffic. Rollback is pointing the deployment at the previous tag.

**Why layer the jar in the image?**
Docker caches by layer. With dependencies in their own layer, a code-only change produces a small application layer; pushes, pulls and node cache hits get much faster. Boot writes `layers.idx` and the `tools` jar mode extracts them.

**How do you size JVM memory in Kubernetes?**
Set the container memory limit, then `MaxRAMPercentage` around 50–75% depending on how much off-heap the app uses (Netty, caches, many threads). Verify with `/actuator/metrics/jvm.memory.used` and NMT (`-XX:NativeMemoryTracking=summary`) if the pod gets OOM-killed despite the heap being fine.

**Liveness vs readiness — what should each check?**
Liveness: only the process's own state, so a dependency outage doesn't cause restart loops. Readiness: whether this instance can serve, including warm caches or an in-progress graceful shutdown. Boot's probe endpoints implement exactly that split.

**What happens on `SIGTERM` to a Boot app with graceful shutdown?**
Readiness flips to refusing traffic, the connector stops accepting, in-flight requests complete up to the configured timeout, then the context closes and `@PreDestroy` hooks run. You keep the timeout below the Kubernetes grace period so you're not SIGKILLed mid-cleanup.

**Dockerfile vs Buildpacks?**
Buildpacks (`spring-boot:build-image`) give a well-tuned, reproducible image with no Dockerfile and a built-in JVM memory calculator. A Dockerfile gives control over the base image, users, extra tools and corporate scanning requirements. Both produce layered images.

**How do you keep secrets out of the image?**
They are never in the jar or the Dockerfile; they arrive at run time via mounted secret files (`configtree:`), a secret manager imported with `spring.config.import`, or injected env vars from the orchestrator's secret store. The image is the same artifact for every environment.

## Pitfalls

- `ENTRYPOINT sh -c "java -jar app.jar"`: the shell is PID 1 and `SIGTERM` never reaches the JVM; graceful shutdown doesn't run.
- Fractional CPU limits (`500m`): the JVM sees one processor, picks SerialGC and one JIT thread. Set `ActiveProcessorCount` or give it 2 CPUs.
- A readiness probe that hits the database: one DB hiccup and the whole deployment is unready at once.
- Running Flyway on every replica's startup against a locked schema without a lock timeout. Flyway takes a lock, but ten replicas starting at once still serialise and slow deploys; consider a migration job.
- Logging to a file inside the container. Write to stdout; files vanish with the pod.

## Key takeaways

- Ship a Spring Boot fat jar or layered image; build with multi-stage Dockerfiles or buildpacks.
- Size the heap relative to the container (`MaxRAMPercentage`), not with fixed `-Xmx` guesses.
- Expose liveness and readiness probes and enable graceful shutdown.
- Run as non-root and keep configuration and secrets outside the image.
- Follow 12-factor principles: one build, many environments.
