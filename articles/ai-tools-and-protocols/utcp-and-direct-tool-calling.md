---
title: UTCP and Direct Tool Calling
order: 4
summary: What the Universal Tool Calling Protocol is, its manuals and call templates, auth and versioning, how it positions itself against MCP, where each fits, and an honest read on maturity.
---

UTCP comes up as the "what about alternatives to MCP?" follow-up. Interviewers want to hear that you understand the architectural difference (a description of how to call the native endpoint versus a server that fronts it), can state the trade-offs without marketing language, and know how small the ecosystem is compared with MCP.

## What UTCP is

The Universal Tool Calling Protocol is an open specification (MPL-2.0 reference implementations, Apache-2.0 spec text) whose central idea is: do not put a server between the agent and the tool. Instead, publish a **manual**, a JSON document that describes each tool and exactly how to call it over its native protocol, and let a UTCP **client** inside the agent make the call directly.

```json
{
  "utcp_version": "1.0.2",
  "manual_version": "1.0.0",
  "tools": [
    {
      "name": "get_order",
      "description": "Look up one order by id.",
      "inputs": {
        "type": "object",
        "properties": { "order_id": { "type": "string" } },
        "required": ["order_id"]
      },
      "outputs": { "type": "object" },
      "tags": ["orders", "read"],
      "tool_call_template": {
        "call_template_type": "http",
        "url": "https://api.example.com/orders/${order_id}",
        "http_method": "GET",
        "auth": { "auth_type": "api_key", "api_key": "${ORDERS_API_KEY}", "var_name": "X-Api-Key", "location": "header" }
      }
    }
  ]
}
```

A manual is typically served at a discovery endpoint such as `GET /utcp`, or generated from an existing OpenAPI document with the bundled converter. Tools are namespaced as `manual_name.tool_name` in the client.

## Call templates and protocol plugins

The `tool_call_template` is the instruction set for one tool. Each `call_template_type` is implemented by a plugin:

| Type | Plugin | Key fields |
|---|---|---|
| `http` | `utcp-http` | `url`, `http_method`, `content_type`, `headers`, `body_field`, `header_fields`, `auth` |
| `sse` | `utcp-http` | `url`, `event_type`, `reconnect`, `retry_timeout`, `auth` |
| `streamable_http` | `utcp-http` | `url`, `http_method`, `chunk_size`, `timeout`, `auth` |
| `cli` | `utcp-cli` | `commands` (run in sequence), `env_vars`, `working_dir`; argument placeholders and output references between commands |
| `text` | `utcp-text` | `file_path` (read a local file or manual) |
| `mcp` | `utcp-mcp` | `config` with `mcpServers`; wraps existing MCP servers as UTCP tools |
| `websocket` | `utcp-websocket` | Documented; less mature |

Sockets and GraphQL plugins are listed as in progress. The project also publishes a "code mode" library for running MCP and UTCP tools through code execution rather than one call per tool.

The client is configured with `manual_call_templates` (where to fetch manuals), `variables` and `load_variables_from` (for `${VAR}` substitution, namespaced per manual), a tool repository, and a tool search strategy (the default matches on tags and description words).

## Auth and versioning

- Auth is declared per call template: `api_key` (with `var_name` and `location`, header by default), `basic` (username and password), and `oauth2` (`token_url`, `client_id`, `client_secret`, optional `scope`, a client-credentials style flow). Secrets are referenced as variables and resolved from the environment or a dotenv-style loader, so they stay out of the manual.
- The protocol sits at 1.x. Manuals carry both `utcp_version` and their own `manual_version`; the project follows semantic versioning, and the 0.1 to 1.0 move was breaking (the `tool_provider` field became `tool_call_template`, a plugin architecture was introduced). Docs exist for 1.0 and 1.1 with migration notes.

Because there is no server in the loop, **authentication is between the client and the native API**. That is the strength (no second auth layer to build) and the weakness (the agent process holds the raw credentials for every tool it can call).

## How it positions itself against MCP

UTCP's own comparison says MCP requires a wrapper server per integration, adds a "double hop" (agent to MCP server to API), re-implements security and costs maintenance, while UTCP calls endpoints directly with the API's existing auth. The part of that which is simply true:

- With MCP there is an extra process or service between agent and API, and someone must write and run it.
- With UTCP, if an OpenAPI spec exists, a manual can be generated and nothing new is deployed.

The part that needs qualifying:

- The "wrapper" in MCP is also where tool curation, output shaping, per-user authorization, consent, rate limiting and audit live. Removing it moves those responsibilities into every client.
- MCP is more than remote procedure calls: resources, prompts, elicitation, structured results, change notifications, and a spec-defined OAuth model. UTCP's scope is narrower by design.
- "Zero latency overhead" and "native security" are claims on the project site without published measurements; present them as positioning.

A fair summary: MCP standardises the **server** side of integration and gives hosts a trust boundary; UTCP standardises a **description** that lets a client skip the server. They are not mutually exclusive: UTCP can consume MCP servers through its `mcp` plugin, and an MCP server can expose tools that are implemented by calling native APIs.

## Where each fits

| Situation | Lean towards |
|---|---|
| Tool must work in Claude, ChatGPT, VS Code, Cursor and other hosts you do not control | MCP (host support is broad; UTCP is not built into mainstream hosts) |
| Per-user OAuth, consent prompts, audit, output limits enforced centrally | MCP server as the policy point |
| Your own agent, your own APIs, OpenAPI already exists, you want no extra deployment | UTCP, or just hand-written tool definitions over `fetch` |
| CLI tools and local scripts in your own agent | UTCP `cli` templates or a thin MCP stdio server |
| Need resources, prompts, elicitation or long-running tasks | MCP |
| Hundreds of endpoints, minimal curation | Neither raw; curate a small tool surface first |

For most teams the honest alternative to MCP inside their own backend is not UTCP but plain tool definitions calling internal functions, which is what UTCP's HTTP template amounts to with a schema around it.

## Maturity and ecosystem, honestly

- Reference implementations exist in Python, TypeScript and Go, with Ruby, Lua and Rust ports at very early stages. Public star counts in late 2026 are in the hundreds per repository (the Python client is the largest, around 700), against tens of thousands for the MCP SDKs and a registry of thousands of MCP servers.
- No mainstream assistant or IDE ships a UTCP client; adoption is within custom agents that embed the library.
- Governance is a community project with a fork-and-PR workflow and no formal body comparable to MCP's working groups and SEP process.
- The spec has already had one breaking major version; expect more churn than MCP, which now has a formal deprecation policy.

In an interview, that reads as: "UTCP is a reasonable idea for direct calls from an agent you control, and a useful lens for the cost of wrapper servers, but in late 2026 MCP is the interoperability standard and the one you should assume when integrating with hosts you do not own."

## Worked example: the same tool both ways

A weather API exists at `GET https://api.weather.example/v1/forecast?city=…&date=…` with an API key header.

**Through an MCP server**, you write and run a small server that defines a `get_forecast` tool and, inside its handler, calls the HTTP API. The host connects to the server; the server holds the API key and makes the call. You own one more process, which can add caching, validation, rate limiting and response shaping.

**With direct calling (the UTCP approach)**, the provider publishes a manual describing the tool and **how to call it** (an HTTP call template: method, URL, parameter mapping, auth scheme). The client reads the manual and calls the API itself; no intermediate server runs.

| Concern | Wrapper server (MCP) | Direct calling (UTCP-style) |
| --- | --- | --- |
| Extra infrastructure | A server process per integration | None beyond the existing API |
| Latency | One extra hop | Direct |
| Credentials | Held by the server | Held by the client |
| Shaping and filtering responses | Easy in the server | Limited to what the API returns |
| Ecosystem and host support | Broad | Smaller |
| Session features (resources, prompts, notifications) | Yes | Not the focus |

Neither is universally better: wrapping helps when you need to adapt, secure or combine APIs; direct calling avoids overhead when an API is already well shaped. In an interview, show you understand the trade-off rather than picking a side.

## Common interview questions

**What is UTCP in one sentence?**
A specification for a "manual" that tells an agent how to call a tool directly over its native protocol (HTTP, CLI, SSE and others), so no wrapper server sits between the agent and the API.

**How does that differ from MCP architecturally?**
MCP puts a server between the host and the data source; the host talks JSON-RPC to it and the server owns the integration, auth and policy. UTCP removes that server and moves the call, and therefore the credentials and policy, into the client.

**What does the MCP server give you that UTCP's direct call does not?**
A single trust boundary: per-user OAuth with audience-bound tokens, consent and approval surfaces, output shaping and limits, audit, and primitives beyond tools (resources, prompts, elicitation). With direct calls each client has to handle those itself.

**When would you choose UTCP?**
For an agent I control calling APIs I control, especially when an OpenAPI spec already exists and I do not want to deploy and operate another service. If the tool must also work in Claude Code, Cursor or ChatGPT, MCP is the only option they support.

**Can the two coexist?**
Yes. UTCP has an `mcp` call template that wraps MCP servers, and an MCP server can be a thin layer over native endpoints. A team can expose MCP to external hosts and call internal APIs directly from its own agent.

**How mature is UTCP?**
Early: a 1.x spec with one breaking major version behind it, reference clients in three languages with star counts in the hundreds, no built-in support in mainstream hosts, and community governance. Say that plainly rather than treating it as a peer of MCP.

**Where do the credentials live in each model?**
In MCP the server holds downstream credentials and the host only holds a token scoped to that server. In UTCP the client resolves API keys or OAuth client secrets from its environment and sends them to each native endpoint, which is simpler but widens the blast radius of a compromised agent.

## Pitfalls

- Treating protocol choice as more important than tool design.
- Exposing raw APIs to models without shaping large responses.
- Putting long-lived secrets in client-side configurations without scoping.

## Key takeaways

- UTCP describes how to call existing tools directly (call templates per protocol), without a wrapper server.
- MCP standardises a client–server protocol with tools, resources and prompts.
- Direct calling reduces hops and infrastructure; wrapping adds control, shaping and security.
- Judge maturity and host support honestly when choosing.
- The underlying skills are the same: good tool descriptions, schemas, auth and error handling.
