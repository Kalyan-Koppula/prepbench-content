---
title: MCP Explained
order: 2
summary: The problem MCP solves, host/client/server roles, server and client primitives, transports, the OAuth 2.1 authorization model, the stateless 2026-07-28 design, a revision history table, and the spec's own security warnings.
---

The Model Context Protocol (MCP) is the open standard for connecting LLM applications to tools and data. It is the most likely protocol question in a late-2026 interview, and the spec changed substantially in 2026, so answer from the current revision (`2026-07-28`) and know what was different before.

## The problem it solves

Before MCP every assistant integrated every data source separately: N apps times M integrations. MCP standardises the integration side once, so a server written for a file system, a database or an issue tracker works in any host that speaks the protocol (Claude, ChatGPT, VS Code, Cursor and others). The intro docs call it "a USB-C port for AI applications"; the spec says it took inspiration from the Language Server Protocol.

It is a JSON-RPC 2.0 protocol. It is not a model API, not an agent framework, and not a replacement for tool calling: inside the host, MCP tools are turned into ordinary tool definitions for whatever model API the host uses.

## Roles

| Role | What it is | Example |
|---|---|---|
| Host | The LLM application that initiates connections and owns the model, UI and consent | Claude Desktop, Claude Code, an IDE, your own app |
| Client | A connector inside the host, one per server connection | The host's MCP client library |
| Server | A process or service exposing context and capabilities | `server-filesystem`, a GitHub server, your internal API wrapper |

The host decides which servers to connect, which tools the model sees, and when a human must approve a call. Servers never talk to the model directly.

## Server primitives

- **Tools**: functions the model can call (`tools/list`, `tools/call`). Each has a `name`, `description`, `inputSchema` (JSON Schema 2020-12 by default), optional `outputSchema` and `structuredContent`, optional `annotations` (`readOnlyHint`, `destructiveHint`, `idempotentHint`, `openWorldHint`) and icons. Results carry `content` blocks (text, image, audio, resource links, embedded resources) and `isError` for execution failures.
- **Resources**: file-like data addressed by URI (`resources/list`, `resources/read`, URI templates), meant for the user or host to attach as context rather than for the model to call.
- **Prompts**: reusable, user-selected templates (`prompts/list`, `prompts/get`), often surfaced as slash commands.

Tools are "model-controlled", resources are "application-controlled", prompts are "user-controlled". That trio is a good interview line.

## Client primitives

- **Elicitation**: the server asks the user for input mid-operation, in `form` mode (a flat schema of primitives rendered by the host) or `url` mode (the host opens a URL for out-of-band flows such as third-party OAuth or payment). Form mode must never be used for secrets.
- **Roots** (deprecated in 2026-07-28): the client tells the server which directories are in scope; the migration is to pass paths as tool arguments or configuration.
- **Sampling** (deprecated in 2026-07-28): the server asks the host's model to generate text; the migration is for servers to call a model API directly.

Since 2026-07-28, servers no longer send JSON-RPC requests to clients. Anything the server needs from the client (elicitation, and the deprecated roots and sampling) is returned as an `InputRequiredResult` with `resultType: "input_required"`; the client retries the original request with `inputResponses`. This "multi round-trip request" pattern is what made the protocol stateless.

## Lifecycle and capability negotiation

Through `2025-11-25` a connection began with an `initialize` handshake that negotiated a protocol version and exchanged capabilities, followed by `notifications/initialized`. In `2026-07-28` that is gone:

- Every request carries `_meta` with `io.modelcontextprotocol/protocolVersion` and `io.modelcontextprotocol/clientCapabilities` (plus client info); every result may carry server info.
- Servers must implement `server/discover`, which returns supported versions, capabilities and identity; clients may call it up front or just send a request and handle `UnsupportedProtocolVersionError`.
- List endpoints must not vary per connection; results carry `ttlMs` and `cacheScope` so clients can cache them, and tools should be listed in deterministic order (prompt caching).
- Change notifications (`tools/list_changed`, resource updates) arrive on the response stream of a long-lived `subscriptions/listen` request the client opts into.
- State across calls (a cart, a browser context) uses explicit server-minted handles passed as tool arguments, not sessions.

Capabilities still exist (`tools.listChanged`, `elicitation.form`, `extensions`), they are just declared per request rather than per session.

## Transports

| Transport | Shape | Use |
|---|---|---|
| stdio | Host spawns the server as a subprocess; newline-delimited JSON-RPC on stdin/stdout; logs go to stderr | Local tools, IDEs, desktop apps |
| Streamable HTTP | One endpoint (e.g. `/mcp`) accepting POST; each request is its own POST; response is either a JSON object or a request-scoped SSE stream; closing the stream cancels | Remote and multi-tenant servers |
| HTTP+SSE (2024-11-05) | Separate GET stream plus POST endpoint | Deprecated since 2025-03-26, formally scheduled for removal; new servers must not use it |

Streamable HTTP details worth knowing: clients send `Accept: application/json, text/event-stream`, an `MCP-Protocol-Version` header that must match `_meta`, and `Mcp-Method`/`Mcp-Name` headers so proxies can route without parsing the body; servers must validate `Origin` (403 on mismatch) to defeat DNS rebinding and should bind to localhost when local. Earlier Streamable HTTP revisions had `Mcp-Session-Id`, an HTTP GET stream, `DELETE` to end a session and `Last-Event-ID` resumability; a `2026-07-28` server ignores or rejects those.

## Authorization

Authorization applies to HTTP transports; stdio servers read credentials from the environment. The model is standard OAuth 2.1, with MCP pinning down discovery:

1. The MCP server is an OAuth **resource server**. It must publish **Protected Resource Metadata** (RFC 9728) and point to it from a `401` `WWW-Authenticate` header, optionally with a `scope` hint.
2. The client discovers the **authorization server** from that metadata and reads its metadata (RFC 8414 or OpenID Connect Discovery).
3. The client obtains a client id: **Client ID Metadata Documents** (an HTTPS URL as the client id, recommended), pre-registration, or Dynamic Client Registration (RFC 7591, deprecated in 2026-07-28 but kept for compatibility).
4. Authorization code flow with **PKCE**, a **`resource` parameter** (RFC 8707) naming the MCP server's canonical URI, and validation of the `iss` parameter in the response (RFC 9207) against the recorded issuer.
5. Tokens go in `Authorization: Bearer`, never in the query string. The server must validate the audience and reject tokens not issued for it.
6. Insufficient scope returns `403` with `WWW-Authenticate: Bearer error="insufficient_scope", scope="…"` and the client steps up by requesting the union of old and new scopes.

The single most-quoted rule: **no token passthrough**. A server must not accept tokens issued for other audiences and must not forward the client's token to a downstream API; it acts as its own OAuth client for third-party services (often via URL-mode elicitation).

## Revision history

| Revision | What changed |
|---|---|
| 2024-11-05 | Initial release: JSON-RPC, stdio and HTTP+SSE, tools, resources, prompts, sampling, roots, `initialize` handshake |
| 2025-03-26 | OAuth 2.1 authorization framework; Streamable HTTP replaces HTTP+SSE; JSON-RPC batching; tool annotations; audio content; completions capability |
| 2025-06-18 | Batching removed; structured tool output and `outputSchema`; servers classified as OAuth resource servers with Protected Resource Metadata; RFC 8707 resource indicators required; elicitation; resource links in tool results; `MCP-Protocol-Version` header; security best practices page |
| 2025-11-25 | OpenID Connect discovery; icons; incremental scope consent via `WWW-Authenticate`; tool-name guidance; URL-mode elicitation; sampling with tools; Client ID Metadata Documents; experimental tasks; SDK tiering and governance |
| 2026-07-28 (current) | Stateless: no handshake or sessions, per-request `_meta` version and capabilities, mandatory `server/discover`; multi round-trip requests replace server-initiated requests; `subscriptions/listen` replaces the GET stream and resource subscriptions; SSE resumability removed; tasks moved to an extension; roots, sampling, logging and DCR deprecated; HTTP+SSE formally deprecated; `ttlMs`/`cacheScope` on list results; OpenTelemetry trace context in `_meta`; feature lifecycle and deprecation policy |

Versions are dates and only change on backwards-incompatible revisions. Deprecated features stay for at least twelve months before removal.

## Extensions

The core protocol is deliberately small; optional extensions negotiated through capabilities add **tasks** (long-running operations with polling and durable handles), **MCP Apps** (interactive UI rendered in the conversation) and **Skills over MCP** (structured instructions delivered through the protocol).

## Security warnings from the spec

- **Confused deputy**: an MCP proxy with a static upstream client id must enforce per-client consent before forwarding authorization, or a consent cookie lets an attacker's dynamically registered client obtain codes.
- **Token passthrough**: forbidden; validate audience, never forward.
- **Injection via tool results and descriptions**: tool descriptions and annotations are untrusted unless the server is; clients should show tool inputs before calling, validate results before giving them to the model, and keep a human able to deny any call.
- **SSRF during OAuth discovery**: a malicious server can point metadata URLs at internal addresses; clients should enforce HTTPS and block private ranges.
- **State handle hijacking**: handles are names, not credentials; bind them to the authenticated user server-side.
- **Local server compromise**: one-click install must show the exact command and get consent; run servers sandboxed.
- **Authorization URL validation**: only `http(s)` schemes, never open URLs through a shell.
- **Scope minimisation**: request and grant the smallest scope set, step up on demand.

## Common interview questions

**What problem does MCP solve that plain tool calling does not?**
Tool calling is between one app and one model; MCP standardises how an app discovers and calls external capabilities so an integration is written once and works in every host. Inside the host, MCP tools are still turned into normal tool definitions for the model.

**Explain host, client and server.**
The host is the LLM application that owns the model, UI and user consent; it creates one client per server connection; servers expose tools, resources and prompts over JSON-RPC. Servers never talk to the model or the user directly, which is what makes consent enforceable.

**What are the three server primitives and who controls each?**
Tools are model-controlled functions, resources are application-controlled data the host attaches as context, and prompts are user-controlled templates. The split lets a host apply different policies to each.

**How does a remote MCP server authenticate users?**
It acts as an OAuth 2.1 resource server: it publishes Protected Resource Metadata, the client discovers the authorization server, registers via a Client ID Metadata Document, and runs an authorization code flow with PKCE and a `resource` parameter bound to the server. Tokens travel as bearer headers and the server validates audience and scopes.

**What is token passthrough and why is it banned?**
It is accepting a token issued for another audience or forwarding the client's token to a downstream API. It breaks audience checks, defeats rate limiting and audit, and creates a confused deputy; the server must obtain its own downstream credentials.

**What changed in the 2026-07-28 revision?**
The protocol became stateless: no `initialize` handshake or sessions, version and capabilities travel in every request, `server/discover` is mandatory, server-to-client requests became multi round-trip results, and roots, sampling, logging and dynamic client registration were deprecated. Streamable HTTP lost its GET stream, session ids and resumability.

**Why was HTTP+SSE replaced?**
It needed two endpoints and a long-lived stream per client, which was awkward behind load balancers and for stateless deployments. Streamable HTTP uses one endpoint where each request is a POST answered by JSON or a request-scoped stream, and the 2026 revision removed the remaining stream state.

**How does a server ask the user a question mid-tool-call?**
Elicitation: the tool returns `resultType: "input_required"` with an `elicitation/create` request (a flat form schema or a URL to open), the host collects the answer, and the client retries the original call with `inputResponses`. Secrets must go through URL mode so they never pass through the client.
