---
title: Tools, MCP and Agents
order: 12
module: ai-tools-and-protocols
summary: Tool calling loop and schemas, MCP roles, primitives, transports, auth and revisions, building and wiring servers, UTCP, agent loops, subagents, context management, A2A, Skills, and coding agents.
---

## What is a tool, from the model's point of view?

A JSON Schema with a name and description that the model can fill in. The model emits a structured call; nothing runs until your code executes it and returns a result.

## Walk through the tool-use loop in one breath.

Send tools plus messages; the model answers with `stop_reason: tool_use` and `tool_use` blocks (id, name, input); you validate and run them; you append the assistant message unchanged and a user message with `tool_result` blocks keyed by id; you call again until `end_turn`.

## How should parallel tool calls be returned?

Run the independent calls concurrently and put every `tool_result` into a single user message. Splitting them across messages teaches the model to stop parallelising; if tools cannot run concurrently, disable parallel calls explicitly.

## Why return a tool failure as a result instead of throwing?

The failure is information the model can act on: with `is_error: true` and an actionable message it can retry with different arguments or tell the user. Throwing loses the loop state, and dropping the result leaves the model confused.

## What does `strict: true` on a tool definition buy you?

Guaranteed schema-valid arguments, so parsing never fails, at the cost of a JSON Schema subset and required `additionalProperties: false`. It does not make the values correct or the call appropriate, so semantic validation and side-effect gates remain.

## Why do several current frontier models reject forced tool use?

They return a 400 for `tool_choice` of `any` or a named tool; the supported path is `auto` plus prompt steering, strict tools for valid arguments, or structured outputs when you only wanted JSON. A forced call also skips pre-call thinking.

## What is the difference between a client tool and a server tool?

A client tool is a schema you define and code you run via the `tool_use` and `tool_result` loop; a server tool (web search, code execution, tool search) runs on the vendor's infrastructure and returns results inline, sometimes with extra per-use pricing.

## What problem does MCP solve?

The N-apps-times-M-integrations problem: it standardises how an LLM application discovers and calls external capabilities, so a server written once works in every host that speaks the protocol. Inside the host, MCP tools still become ordinary model tool definitions.

## Define host, client and server in MCP.

The host is the LLM application that owns the model, UI and consent; it creates one client per server connection; the server exposes tools, resources and prompts over JSON-RPC. Servers never talk to the model or user directly.

## Who controls each of the three MCP server primitives?

Tools are model-controlled functions, resources are application-controlled data the host attaches as context, and prompts are user-controlled templates often surfaced as slash commands.

## What is elicitation and what are its two modes?

A server asking the user for input mid-operation. Form mode renders a flat schema of primitives in the host; URL mode opens a link for out-of-band flows such as third-party OAuth or payments, and must be used for anything secret.

## What happened to sampling and roots in the 2026-07-28 MCP revision?

Both were deprecated, along with logging. Servers should call model APIs directly instead of sampling, and receive directories as tool arguments or configuration instead of roots; deprecated features stay for at least twelve months before removal.

## How does MCP negotiate protocol versions today?

There is no handshake: every request carries its protocol version and client capabilities in `_meta`, the server accepts or rejects each request, and a mandatory `server/discover` RPC returns supported versions and capabilities for clients that want to pick up front.

## What replaced server-initiated requests in MCP?

Multi round-trip requests: a server that needs input returns `resultType: "input_required"` with the requests it needs answered, and the client retries the original call with `inputResponses`. This removed the need for a long-lived server-to-client stream.

## Describe the Streamable HTTP transport as of 2026-07-28.

A single endpoint accepting POST; each JSON-RPC request is its own POST answered with a JSON object or a request-scoped SSE stream; closing the stream cancels. Clients send `Accept` for both types, an `MCP-Protocol-Version` header matching `_meta`, and `Mcp-Method` and `Mcp-Name` headers for routing; there is no GET stream, session id or resumability.

## Why must a Streamable HTTP server validate the `Origin` header?

To block DNS rebinding, where a web page tricks the browser into talking to a local MCP server. The spec requires a 403 on an invalid `Origin` and recommends binding local servers to localhost.

## What role does an MCP server play in OAuth, and what must it publish?

It is an OAuth 2.1 resource server and must publish Protected Resource Metadata (RFC 9728), pointed to from a 401 `WWW-Authenticate` header, so clients can discover the authorization server.

## What is the `resource` parameter for in MCP authorization?

RFC 8707 resource indicators: the client names the MCP server's canonical URI in both the authorization and token requests so the token is bound to that audience. The server must then validate that tokens were issued for it.

## What is token passthrough and why is it forbidden?

Accepting tokens issued for other audiences or forwarding the client's token to a downstream API. It breaks audience checks, rate limiting and audit, and creates a confused deputy; servers must obtain their own downstream credentials, often via URL-mode elicitation.

## How do clients register with an authorization server in MCP now?

Preferably with a Client ID Metadata Document, an HTTPS URL used as the client id that the server fetches; pre-registration is also fine; Dynamic Client Registration is deprecated but kept for servers that do not support metadata documents.

## Why should a stdio MCP server never write to stdout?

stdout is the JSON-RPC channel; a stray `console.log` corrupts framing and the host drops the connection. Logs go to stderr, which the spec permits for all levels.

## What does `serveStdio` do beyond `server.connect(new StdioServerTransport())`?

It negotiates the protocol era per client, so one binary serves both 2026-07-28 hosts and hosts that still start with the 2025 `initialize` handshake, calling your factory for a fresh server each time. Manual wiring only serves the old era.

## How do you test an MCP server before adding it to an IDE?

With the MCP Inspector: the web UI to call tools and watch the JSON-RPC exchange, or the CLI (`--method tools/list`, `--method tools/call`) in CI. Check both `--protocol-era modern` and `legacy`.

## What are the three worst MCP server design mistakes?

Huge tool lists of thin endpoint wrappers, vague descriptions that give the model no idea when to call what, and unbounded outputs that flood the context and get truncated by the host. Consolidate, describe carefully, paginate.

## How do Claude Code, Claude Desktop and Cursor load MCP servers?

All read a JSON `mcpServers` map: `command`, `args`, `env` for stdio or `url` (plus `headers`) for remote. Claude Code uses `claude mcp add` or a committed `.mcp.json` with local, project and user scopes; Desktop uses `claude_desktop_config.json`; Cursor uses `.cursor/mcp.json` or `~/.cursor/mcp.json`.

## What is UTCP in one sentence?

A specification for a "manual" describing how an agent should call a tool directly over its native protocol (HTTP, CLI, SSE and others), so no wrapper server sits between the agent and the API.

## How mature is UTCP relative to MCP?

Early: a 1.x spec with one breaking major version behind it, reference clients in Python, TypeScript and Go with star counts in the hundreds, no built-in support in mainstream hosts, and community governance. MCP is the interoperability standard hosts actually ship.

## What are the stop conditions of a well-built agent loop?

The model finishes, a verifier passes (tests, schema), a budget trips (steps, tokens, time), a tool times out, or a human denies an action. Each exit returns a typed outcome and the loop detects repeated identical calls.

## What are the costs of subagents?

Two lossy hand-offs (the brief in, the summary out), the parent cannot see what the child skipped, and fan-out spends tokens in a burst. Write briefs like a peer's, cap child budgets and never allow unbounded spawning.

## Name the main techniques for managing context in a long agent run.

Clear stale tool results, compact earlier history into a summary block, externalise plans and findings to files or a memory tool, prefer retrieval over inclusion, and cache the stable prefix.

## How do A2A and MCP divide responsibilities?

MCP connects an agent to tools and data; A2A connects agents to each other through agent cards, messages, tasks with a lifecycle, and artifacts, over JSON-RPC, gRPC or HTTP+JSON. A2A's own line is that MCP is vertical and A2A is horizontal.

## What is an Agent Skill and how does it relate to MCP?

A folder with a `SKILL.md` (name and description frontmatter plus a procedure) and optional scripts, loaded progressively so only the description costs context until it is used. MCP supplies capabilities; skills supply procedures for using them well.

## How do coding agents decide whether a tool call needs your approval?

Through a permission policy in the harness: allow and deny rules per tool, command prefix or path, interactive prompts for the rest, and hooks that can block a call regardless of the model. Instruction files are context, not enforcement.

## What belongs in `CLAUDE.md` and what belongs in a skill?

`CLAUDE.md` holds short, always-loaded facts: build and test commands, conventions, what not to touch. Skills hold long procedures and scripts that load only when invoked. Keep `CLAUDE.md` under about 200 lines because it is paid for on every turn.

## How do you review a coding agent's work without rubber-stamping it?

Read the diff rather than the summary, run tests and check they were not weakened, look for scope creep and new dependencies, verify claims about the codebase with a grep, and gate pushes behind approval. Ask for a plan first on anything non-trivial.
