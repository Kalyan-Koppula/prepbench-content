---
title: Maven in One Page
order: 1
summary: POM anatomy, coordinates, the lifecycle, scopes, dependency mediation and BOMs, plugins, profiles, the Boot parent — and the Gradle equivalents.
---

Maven is `package.json` + `npm` + the build scripts, all driven by one XML file and a fixed lifecycle. Interviewers rarely ask deep Maven questions, but they do expect you to read a POM, explain why a dependency version "won", and know what `mvn verify` actually runs.

## Mental model from npm

| npm | Maven |
|---|---|
| `package.json` | `pom.xml` |
| `name` + `version` | `groupId:artifactId:version` (GAV coordinates) |
| `dependencies` / `devDependencies` | `<dependencies>` with a `<scope>` per entry |
| `node_modules` | `~/.m2/repository` (one shared local cache, no per-project copy) |
| npm registry | Maven Central (plus your company's Nexus/Artifactory mirror) |
| `scripts` | lifecycle phases bound to plugin goals |
| `package-lock.json` | none — resolution is deterministic from the POM alone, so there is nothing to lock |
| workspaces | multi-module projects (`<modules>` in a parent POM) |
| `npx tool` | `mvn plugin:goal` |

Two things have no npm equivalent: the **lifecycle** (a fixed, ordered set of phases) and **inheritance** (a POM can have a parent POM whose settings it inherits).

## POM anatomy

```xml
<project>
  <modelVersion>4.0.0</modelVersion>

  <parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.5.6</version>
    <relativePath/> <!-- resolve from the repository, not a local directory -->
  </parent>

  <groupId>com.acme</groupId>
  <artifactId>orders-service</artifactId>
  <version>0.1.0-SNAPSHOT</version>
  <packaging>jar</packaging>            <!-- jar | war | pom -->

  <properties>
    <java.version>21</java.version>
    <testcontainers.version>1.21.3</testcontainers.version>
  </properties>

  <dependencies>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-web</artifactId>
      <!-- no version: managed by the parent -->
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-test</artifactId>
      <scope>test</scope>
    </dependency>
    <dependency>
      <groupId>org.projectlombok</groupId>
      <artifactId>lombok</artifactId>
      <optional>true</optional>      <!-- not passed on to anyone depending on us -->
    </dependency>
  </dependencies>

  <build>
    <plugins>
      <plugin>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-maven-plugin</artifactId>
      </plugin>
    </plugins>
  </build>
</project>
```

- `-SNAPSHOT` means "mutable, in development": Maven re-checks the remote repository for a newer build. Release versions are immutable; once published they are never changed.
- `packaging pom` is for parent/aggregator POMs that only hold config and `<modules>`.
- `mvn help:effective-pom` prints the POM after inheritance and interpolation. That is what Maven actually runs.

## The lifecycle

Running a phase runs every phase before it. The `default` lifecycle, in order:

```text
validate → compile → test-compile → test → package → verify → install → deploy
```

| Phase | What is bound to it by default |
|---|---|
| `compile` | `maven-compiler-plugin:compile` — runs `javac` into `target/classes` |
| `test` | `maven-surefire-plugin:test` — runs unit tests (`*Test`, `Test*`, `*Tests`, `*TestCase`) |
| `package` | `maven-jar-plugin:jar` → `target/app.jar`; Boot's plugin then `repackage`s it into an executable JAR |
| `verify` | `maven-failsafe-plugin` runs integration tests (`*IT`), plus any checks like Checkstyle, JaCoCo thresholds |
| `install` | copies the artifact into `~/.m2` so other local projects can depend on it |
| `deploy` | uploads to a remote repository |

`clean` is a separate lifecycle (`mvn clean` deletes `target/`), and `site` is a third one. The commands you type daily:

```bash
mvn clean verify                      # CI's default: build, unit + integration tests
mvn package -DskipTests               # compile tests, don't run them
mvn package -Dmaven.test.skip=true    # don't even compile tests (breaks if main code needs test-jar)
mvn test -Dtest=OrderServiceTest      # one class
mvn test -Dtest='OrderServiceTest#placesOrder*'   # one method (glob allowed)
mvn test -Dtest='Order*Test' -Dsurefire.failIfNoSpecifiedTests=false
mvn -pl orders-service -am verify     # multi-module: this module and what it depends on
mvn -o verify                         # offline
mvn -U verify                         # force snapshot/metadata update
mvn dependency:tree -Dincludes=com.fasterxml.jackson.core   # who pulls in what
mvn versions:display-dependency-updates
```

## Scopes

| Scope | On compile classpath | On test classpath | On runtime classpath | Packaged / transitive | Typical |
|---|---|---|---|---|---|
| `compile` (default) | yes | yes | yes | yes | most things |
| `provided` | yes | yes | no | no | servlet API when deploying a WAR, Lombok (annotation processor only) |
| `runtime` | no | yes | yes | yes | JDBC drivers, Logback implementation |
| `test` | no | yes | no | no | JUnit, Mockito, Testcontainers |
| `import` | — | — | — | — | only in `dependencyManagement`, to pull in a BOM |
| `system` | yes | yes | no | no | local jar path; avoid |

`<optional>true</optional>` is orthogonal: the dependency is used normally here but not inherited by consumers of your artifact.

## Dependency mediation and BOMs

Maven resolves transitive conflicts with **nearest wins**: the version declared closest to your project in the dependency tree is used; at equal depth, the first declaration in the POM wins. It does not pick the highest version (Gradle does). This is why a stale transitive `jackson-databind` can appear: something you declared early pulled it in at depth 1.

Tools for controlling it:

- `<dependencyManagement>` pins a version (and scope/exclusions) for a coordinate **without adding it**. Any direct or transitive occurrence then uses that version. This is how the Boot parent manages hundreds of versions.
- A **BOM** (bill of materials) is a `packaging pom` artifact containing only a `dependencyManagement` block. Import it with `scope import`:

```xml
<dependencyManagement>
  <dependencies>
    <dependency>
      <groupId>org.testcontainers</groupId>
      <artifactId>testcontainers-bom</artifactId>
      <version>1.21.3</version>
      <type>pom</type>
      <scope>import</scope>
    </dependency>
  </dependencies>
</dependencyManagement>
```

- `<exclusions>` drop a transitive dependency (classic: exclude `spring-boot-starter-logging` to use Log4j2).
- `mvn dependency:tree -Dverbose` shows omitted versions and why ("omitted for conflict").

## Plugins

Everything Maven does is a plugin goal; the lifecycle only decides when they run. Plugins you will see in every Boot POM:

| Plugin | Does |
|---|---|
| `maven-compiler-plugin` | `javac`; the Boot parent sets `<release>` from `java.version` and adds `-parameters` (Spring MVC needs it for parameter names since Framework 6.1) |
| `maven-surefire-plugin` | unit tests in `test` |
| `maven-failsafe-plugin` | integration tests in `integration-test`/`verify`, so a failing IT still runs `post-integration-test` teardown |
| `spring-boot-maven-plugin` | `repackage` into an executable JAR, `spring-boot:run`, `build-image` (Buildpacks, no Dockerfile) |
| `jacoco-maven-plugin` | coverage report and thresholds |
| `maven-enforcer-plugin` | fail on banned dependencies, duplicate classes, wrong JDK |

## Profiles

A profile is a conditional slice of the POM: extra dependencies, properties or plugin config activated by `-P`, an env var, a JDK, an OS, or a file's presence.

```xml
<profiles>
  <profile>
    <id>integration</id>
    <activation><property><name>env.CI</name></property></activation>
    <build><plugins><plugin><artifactId>maven-failsafe-plugin</artifactId>…</plugin></plugins></build>
  </profile>
</profiles>
```

```bash
mvn verify -Pintegration
```

Do not confuse Maven profiles (build-time, which code and plugins) with Spring profiles (run-time, which beans and properties). Interviewers like this distinction.

## The Spring Boot parent

`spring-boot-starter-parent` gives you: managed versions for the whole Boot ecosystem, Java release settings, UTF-8, `-parameters`, resource filtering of `application*.yml` (so `@project.version@` works), and the Boot plugin's `repackage` execution. If your company already has a corporate parent, you can't inherit from two, so import `spring-boot-dependencies` as a BOM instead and configure the plugin yourself. Upgrading Boot is then one version number in one place.

A **starter** (`spring-boot-starter-web`, `-data-jpa`, `-validation`, `-test`) is an empty jar whose only job is to pull in a curated, version-aligned set of dependencies. `spring-boot-starter-test` alone brings JUnit 5, Mockito, AssertJ, Hamcrest, JSONassert and Spring's test support.

## Gradle equivalents

Gradle (Kotlin DSL) is the other build you'll meet, especially at Android-heavy or Kotlin shops. Same concepts, different words:

| Maven | Gradle |
|---|---|
| `pom.xml` | `build.gradle.kts` + `settings.gradle.kts` |
| `mvn clean verify` | `./gradlew clean build` |
| `mvn test -Dtest=FooTest` | `./gradlew test --tests 'com.acme.FooTest'` |
| `-DskipTests` | `-x test` |
| `compile` scope | `implementation` (not exposed to consumers) or `api` (exposed; needs `java-library` plugin) |
| `provided` | `compileOnly` (+ `annotationProcessor` for Lombok) |
| `runtime` | `runtimeOnly` |
| `test` | `testImplementation`, `testRuntimeOnly` |
| `dependencyManagement` / BOM | `platform("org.springframework.boot:spring-boot-dependencies:3.5.6")` or the Spring dependency-management plugin |
| nearest-wins mediation | highest version wins by default; `strictly` / `resolutionStrategy` to force |
| `mvn dependency:tree` | `./gradlew dependencies --configuration runtimeClasspath` |
| profiles | plain Kotlin `if` on project properties, or separate plugin configuration |
| `spring-boot:run` | `./gradlew bootRun`; `bootJar` builds the executable jar |
| `~/.m2` | `~/.gradle/caches` plus the Gradle daemon (fast incremental builds, build cache) |

Gradle is a program, Maven is a declaration. Gradle is faster and more flexible; Maven is more predictable and easier to read in a code review. Say that and move on.

## Common interview questions

**Two libraries you use both depend on different versions of Jackson. Which one does Maven pick?**
Nearest in the tree wins; at the same depth the first declared wins. Neither rule means "highest". If that picks a version that's too old, pin it in `dependencyManagement` — the Boot parent already does this for Jackson, which is why you rarely see the problem in Boot apps.

**What's the difference between `mvn package` and `mvn install`?**
`package` builds the artifact in `target/`. `install` additionally copies it into the local repository so other projects on this machine can resolve it. `deploy` pushes it to a shared repository.

**What does the Spring Boot parent actually do for you?**
Dependency version management via `spring-boot-dependencies`, sensible compiler settings (`release`, `-parameters`, UTF-8), resource filtering, and the Boot Maven plugin's `repackage` goal wired into `package`. Without it you import the BOM and configure those yourself.

**Why do integration tests use failsafe instead of surefire?**
Surefire fails the build in the `test` phase, before `package`, so a packaged artifact or started container wouldn't exist. Failsafe runs in `integration-test` and only fails in `verify`, so `post-integration-test` can still tear down containers.

**`-DskipTests` vs `-Dmaven.test.skip=true`?**
`-DskipTests` compiles tests but doesn't run them. `maven.test.skip` also skips compiling them, which is faster but breaks modules that depend on a test-jar, and lets broken tests rot unnoticed.

**What is a BOM and when do you import one?**
A POM containing only `dependencyManagement` that version-aligns a family of libraries. You import it with `type pom, scope import` so you can declare members without versions and know they're compatible. Boot, Testcontainers, AWS SDK, Jackson and Spring Cloud all publish one.

**What is a SNAPSHOT?**
A mutable version that Maven re-resolves from the remote (by default daily, `-U` forces it). Use it between releases; never let a released artifact depend on a snapshot.

**How does Gradle's dependency resolution differ from Maven's?**
Gradle picks the highest requested version of a conflicting dependency and supports rich constraints (`strictly`, `prefer`, `reject`); Maven picks the nearest. Gradle also separates `implementation` from `api` so transitive leakage is explicit.

## Pitfalls

- Declaring a version on a Boot-managed starter. You override the curated one and skip the BOM alignment; leave it blank.
- Forgetting `<relativePath/>` on the Boot parent in a multi-module repo: Maven looks for `../pom.xml` first and warns loudly.
- Running `mvn test` and wondering why `*IT` classes didn't run. They're failsafe's, bound to `verify`.
- Putting Lombok at `compile` scope without `optional`: consumers of your library now depend on Lombok.
- Hunting a "missing class at runtime" bug in code when it's a `provided`-scope dependency that was never packaged.
