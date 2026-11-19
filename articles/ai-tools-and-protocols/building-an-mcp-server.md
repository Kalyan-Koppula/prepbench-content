---
title: Building an MCP Server
order: 3
summary: A minimal TypeScript server with one tool and one resource, stdio for local use and Streamable HTTP for remote, the MCP Inspector, wiring into Claude Code, Claude Desktop and Cursor, and the mistakes that make servers unusable.
---

"Have you built an MCP server?" is now a standard question. The code is small; what interviewers listen for is whether you know the transports, how to test it, how hosts load it, and why most servers in the wild are bad.

## Packages

The TypeScript SDK v2 (released July 2026, targeting spec `2026-07-28`) split the old `@modelcontextprotocol/sdk` into scoped packages:

| Package | Purpose |
|---|---|
| `@modelcontextprotocol/server` | `McpServer`, `registerTool`, `registerResource`, `createMcpHandler`, stdio under `/stdio` |
| `@modelcontextprotocol/client` | Client side, `StdioClientTransport` under `/stdio` |
| `@modelcontextprotocol/node`, `/express`, `/hono`, `/fastify` | Runtime and framework adapters for Streamable HTTP |
| `@modelcontextprotocol/inspector` | Dev tool (web, CLI, TUI) |

Schemas use Standard Schema, so Zod v4 (`zod ^4.2`), Valibot or ArkType all work; Zod v3 is not supported. v1 lives on a `v1.x` branch with fixes for at least six months after the v2 release, and a codemod (`npx @modelcontextprotocol/codemod@latest v1-to-v2 .`) does most of a migration.

```bash
npm install @modelcontextprotocol/server zod
```

## A minimal server: one tool, one resource

```ts
// src/server.ts
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/server";
import * as z from "zod/v4";

// A factory: transports call this per connection or per request,
// so it must return a fresh instance every time.
export function createServer() {
  const server = new McpServer({ name: "orders", version: "1.0.0" });

  server.registerTool(
    "get_order",
    {
      title: "Get order",
      description:
        "Look up one order by id. Use when the user names a specific order. " +
        "Returns status, line items and totals; never returns payment details.",
      inputSchema: z.object({
        order_id: z.string().regex(/^ORD-\d{5}$/).describe("Order id, e.g. ORD-12345"),
      }),
      annotations: { readOnlyHint: true, idempotentHint: true },
    },
    async ({ order_id }) => {
      const order = await db.orders.find(order_id);
      if (!order) {
        return { isError: true, content: [{ type: "text", text: `No order ${order_id}. Ids are ORD- plus five digits.` }] };
      }
      return {
        content: [{ type: "text", text: JSON.stringify(order) }],
        structuredContent: order,
      };
    },
  );

  server.registerResource(
    "order-policy",
    "policy://orders/returns",
    { title: "Returns policy", mimeType: "text/markdown" },
    async (uri) => ({ contents: [{ uri: uri.href, mimeType: "text/markdown", text: RETURNS_POLICY }] }),
  );

  // Templated resources take a ResourceTemplate; variables arrive as the second arg.
  server.registerResource(
    "order-invoice",
    new ResourceTemplate("orders://{orderId}/invoice", { list: undefined }),
    { title: "Invoice", mimeType: "application/json" },
    async (uri, { orderId }) => ({ contents: [{ uri: uri.href, text: await invoiceJson(String(orderId)) }] }),
  );

  return server;
}
```

Notes:

- Execution failures return `isError: true` with text the model can act on; protocol errors (unknown tool, bad params) are raised by the SDK.
- `structuredContent` must match `outputSchema` if you declare one; also return the JSON as text for older clients.
- Resource template variables are client-controlled input. If they map to paths, resolve and bound-check them.

## stdio for local use

```ts
// src/stdio.ts
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { createServer } from "./server.js";

serveStdio(createServer, {
  onerror: (err) => console.error("orders server error:", err),
});
console.error("orders server listening on stdio");
```

`serveStdio` negotiates the protocol era per client, so the same binary serves `2026-07-28` hosts and hosts that still open with the 2025 `initialize` handshake. Two rules that bite everyone once:

- **Never write to stdout.** stdout is the JSON-RPC channel; one stray `console.log` corrupts the stream. Log to stderr or a file.
- Credentials come from the environment (the host passes `env`), not from OAuth.

## Streamable HTTP for remote use

```ts
// src/http.ts
import { createMcpExpressApp } from "@modelcontextprotocol/express";
import { toNodeHandler } from "@modelcontextprotocol/node";
import { createMcpHandler } from "@modelcontextprotocol/server";
import { createServer } from "./server.js";

const handler = createMcpHandler(createServer); // factory runs once per request
const app = createMcpExpressApp();                // validates Host/Origin by default
const node = toNodeHandler(handler);
app.all("/mcp", (req, res) => void node(req, res, req.body));
app.listen(3000);
```

- The handler is stateless: a fresh `McpServer` per request, so it scales horizontally and matches the `2026-07-28` model. Create connection pools at module scope, not inside the factory.
- Responses are JSON by default and switch to SSE only when the tool emits progress notifications before its result.
- The default app binds to loopback and rejects non-localhost `Host`/`Origin`; for a public deployment pass `allowedHosts` and put bearer-token verification (`requireBearerAuth` from the express package, or your own middleware) in front of the route. The handler does not verify tokens itself.
- Web-standard runtimes (Workers, Deno, Bun) export `handler.fetch` directly without the Node adapter.

## Testing with the MCP Inspector

```bash
# Web UI: list tools, call them with a form, watch the JSON-RPC exchange
npx @modelcontextprotocol/inspector node build/stdio.js

# CLI: scriptable, good for CI
npx @modelcontextprotocol/inspector --cli node build/stdio.js --method tools/list
npx @modelcontextprotocol/inspector --cli node build/stdio.js --method tools/call \
  --tool-name get_order --tool-arg order_id=ORD-12345

# Remote server
npx @modelcontextprotocol/inspector --server-url http://localhost:3000/mcp --transport http
```

Run `--method tools/list` with `--protocol-era modern` and again with `--protocol-era legacy`; the Inspector defaults to legacy, so a server that only answers modern clients looks broken until you check both. The web client handles the OAuth flow for remote servers and stores tokens in the OS keychain.

## Wiring it into hosts

Claude Code:

```bash
claude mcp add orders -- node /abs/path/build/stdio.js          # stdio, local scope
claude mcp add --transport http orders-remote https://orders.example.com/mcp
```

Or commit a project-scoped `.mcp.json`:

```json
{
  "mcpServers": {
    "orders": { "command": "node", "args": ["build/stdio.js"], "env": { "DB_URL": "${DB_URL}" } },
    "orders-remote": { "type": "http", "url": "https://orders.example.com/mcp" }
  }
}
```

Tools appear to the model as `mcp__orders__get_order`, which is the name you use in permission rules and hook matchers. Remote OAuth is completed with `/mcp` in the session. Output over `MAX_MCP_OUTPUT_TOKENS` (default 25,000, warning at 10,000) is truncated, and tool search is on by default so large tool lists are loaded on demand.

Claude Desktop reads `claude_desktop_config.json` (`~/Library/Application Support/Claude/` on macOS, `%AppData%\Claude\` on Windows) with the same `mcpServers` / `command` / `args` shape; use absolute paths and restart the app.

Cursor reads `.cursor/mcp.json` (project) or `~/.cursor/mcp.json` (global) with `command`/`args`/`env` for stdio or `url`/`headers` for remote, supports OAuth with PKCE, and asks for approval before running a tool unless it is allow-listed.

## Common mistakes

- **Huge tool lists.** Fifty thin wrappers around REST endpoints bury the model in schemas and cost tokens on every turn. Consolidate into a handful of task-shaped tools with an `action` enum and good filters.
- **Vague descriptions.** "Gets an order" tells the model nothing about when to call it or what the id looks like. Write a few sentences: purpose, when not to use it, parameter formats, what is not returned.
- **Unbounded outputs.** Returning a whole table or file floods the context and gets truncated by the host anyway. Paginate, filter, truncate with a sensible default, and offer a concise mode.
- **Logging to stdout** on stdio servers.
- **Non-deterministic tool order** or per-connection tool lists, which defeat client caching and prompt caching.
- **Trusting `annotations` from unknown servers** on the host side, or omitting them on your own tools so hosts cannot apply read-only policies.
- **Passing the client's token downstream** instead of obtaining your own credentials.
- **Skipping the Inspector** and debugging inside a chat UI, where you cannot see the JSON-RPC exchange.
- **Shipping an HTTP server without `Origin` validation or auth**, which exposes it to DNS rebinding from any web page.

## Worked example: designing an MCP server for an issue tracker

Before writing code, decide what the server exposes and how a model will use it:

| Primitive | Item | Why it's this primitive |
| --- | --- | --- |
| Tool | `search_issues(query, status?, assignee?)` | The model decides when to search |
| Tool | `get_issue(id)` | Fetch full details on demand |
| Tool | `create_issue(title, body, labels?)` | A side effect: the host should ask the user to approve |
| Tool | `add_comment(issue_id, body)` | Side effect, same approval rule |
| Resource | `tracker://projects/{key}/readme` | Reference material the user or host attaches as context |
| Prompt | `triage_issue` with an `issue_id` argument | A reusable, user-invoked workflow ("triage this issue") |

Design decisions:

- **Few, task-shaped tools** rather than one per REST endpoint: `search_issues` combines several API filters, so the model doesn't chain calls.
- **Annotations** mark read-only versus destructive tools (`readOnlyHint`, `destructiveHint`), so hosts can apply approval policies.
- **Output size limits**: search returns the top 20 issues with ids, titles and statuses, not full bodies; `get_issue` returns the detail. That keeps the model's context small.
- **Errors as results**: "issue ABC-123 not found" is returned with `isError: true`, so the model can correct the id.
- **Auth**: for a local stdio server, the user's API token comes from an environment variable set by the host configuration; for a remote server, OAuth with the tracker as authorisation server, so each user acts with their own permissions.

Testing plan: exercise each tool in the MCP Inspector, then connect it to a host and run five realistic requests ("find my open bugs about login", "file a bug for …"), checking which tools were chosen and with which arguments. Poor choices usually mean a tool description needs rewriting, not a model change.

## Common interview questions

**What is the smallest useful MCP server?**
One `McpServer` with a single `registerTool` whose schema is a Zod object and whose handler returns `content` blocks, served with `serveStdio`. Add a resource for static context the host can attach, and that is enough to plug into Claude Code or Cursor.

**When do you choose stdio versus Streamable HTTP?**
stdio when the host launches the server on the same machine (IDE tools, local files, personal credentials in env). Streamable HTTP when the server is shared, remote or multi-tenant and needs OAuth, horizontal scaling and a single endpoint behind a load balancer.

**Why must a stdio server never print to stdout?**
stdout is the JSON-RPC transport itself; any non-protocol bytes corrupt framing and the host drops the connection. Logs go to stderr, which the spec explicitly allows for all log levels.

**How do you test an MCP server before wiring it into an IDE?**
With the MCP Inspector: the web UI to click through tools, resources and prompts while watching the raw messages, and the CLI in CI to list tools and call one with fixed arguments. Check both protocol eras so legacy hosts still work.

**How does a remote server handle many users?**
Statelessly: `createMcpHandler` builds a fresh server per request, authorization is a bearer token validated per request, and any cross-call state is an explicit handle returned by a tool and bound to the authenticated user on the server.

**What makes a tool definition good from the model's point of view?**
A precise name, a description that says when to use it and when not to, parameter descriptions with formats, bounded and high-signal output, and honest annotations so the host can auto-approve read-only calls.

**How do hosts decide whether to run a tool?**
The host applies its own policy: Claude Code uses permission rules keyed on `mcp__server__tool`, Cursor prompts unless allow-listed, and hosted connectors let you enable, disable or defer tools per server. Annotations inform that policy but a host must not trust them from an unknown server.

## Key takeaways

- Design the surface first: tools for model-driven actions, resources for context, prompts for user-invoked workflows.
- Keep tools few, task-shaped and well described; bound their output size.
- Mark side-effecting tools so hosts can require approval.
- Use stdio for local servers and Streamable HTTP with OAuth for remote ones.
- Test with the MCP Inspector, then with real requests in a host.
