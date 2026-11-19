---
title: Streaming UX for Frontends
order: 4
summary: Transports for token streams, rendering partial markdown safely, cancel and resume, optimistic UI, showing tool calls and citations, accessibility, and error states, with a small TypeScript client.
---

Streaming is the part of an LLM feature a frontend engineer owns outright, and it is where interviews for full-stack roles go deep: the transport choice, partial rendering, cancellation, reconnects, and making the whole thing accessible. The model usually takes seconds to finish; the user should see the first token in well under one.

## Transport

| Transport | Direction | Fits when | Watch for |
|---|---|---|---|
| Fetch + `ReadableStream` (chunked or SSE body) | Server to client | Default for chat: one request, one response stream; `AbortController` for cancel; works with normal auth headers and POST bodies | You parse frames yourself; no built-in reconnect |
| `EventSource` (SSE) | Server to client | Simple subscriptions, auto-reconnect with `Last-Event-ID` | GET only, no custom headers (cookies only), limited connections per origin on HTTP/1.1 |
| WebSocket | Both ways | Voice, collaborative sessions, many messages per connection, server-initiated events | Own auth and reconnection logic; proxies and serverless hosts handle it worse; overkill for a single reply |
| Long polling / polling | Client pulls | Fallback when streaming is blocked by infrastructure | Latency and load |

Model answer: a `POST` with a streaming response body in SSE format, consumed with `fetch`. SSE as a wire format gives you named events and ids for resume without the `EventSource` restrictions. Reach for WebSockets only when the client also needs to send mid-stream (interrupting a voice agent, live collaboration).

Server side, the provider SDK streams events (text deltas, tool-call input deltas, usage, stop reason); your API translates them into your own event schema so the client does not depend on a vendor format and you can swap models.

```text
event: delta        data: {"text":"The 30-day "}
event: tool_call    data: {"id":"t1","name":"search","status":"running"}
event: tool_result  data: {"id":"t1","status":"done","summary":"3 results"}
event: citation     data: {"index":1,"title":"Refund policy","url":"..."}
event: done         data: {"messageId":"m_9","usage":{"input":812,"output":210}}
event: error        data: {"code":"rate_limited","retryable":true}
```

Include an `id:` on each frame (or a sequence number in the payload) so a client can resume.

## Rendering partial markdown safely

- **Never set `innerHTML` from model output.** Parse markdown to an AST or to sanitised HTML (DOMPurify or an allowlist renderer), and render links with `rel="noopener"` and no `javascript:` URLs. Model output is untrusted input, including from your own retrieval corpus.
- **Parse the accumulated text, not the delta.** Markdown is not streamable token by token; a `**` or a code fence may not close for hundreds of tokens. Re-render from the full buffer on each frame, throttled to animation frames (16–50 ms) so you are not re-parsing on every token.
- **Close open constructs provisionally.** While streaming, treat an unclosed fence as a code block and an unclosed emphasis as plain text to stop the layout jumping between two interpretations.
- **Stable keys for blocks.** Render by block index so React reconciles the growing last block instead of remounting the whole message; memoise completed blocks.
- **Code blocks**: syntax-highlight only when the fence closes; show plain monospace meanwhile.
- **Tables and math** look broken until complete; render them once they close or show a skeleton.

## Cancel and abort

- Keep the `AbortController` in a ref; wire it to a Stop button and to route changes and component unmount.
- On the server, propagate the abort to the model call so you stop paying for tokens no one will read; most SDKs accept the signal.
- Keep what was already streamed, mark the message as "stopped", and allow "continue" by sending the partial as the assistant turn plus a continuation request.
- A new prompt while one is streaming should abort the old stream first, then start the new one; otherwise two streams write into the same message.

## Retries and resume

- **Before first byte**: retry with backoff and jitter (network error, 429, 5xx), at most two or three times; the user sees a "thinking" state throughout.
- **Mid-stream drop**: do not blindly retry; you would re-run the generation and pay twice. Give the stream a server-side id and buffer frames by id for a short window (Redis, in-memory with a TTL) so the client can reconnect with `Last-Event-ID` or `?after=<seq>` and receive the rest.
- If resume is not possible, offer "regenerate" explicitly rather than silently producing a different answer.
- Make the send endpoint idempotent with a client-generated message id, so a retried POST does not create two user messages.

## Optimistic UI

Append the user's message locally with a pending state the moment they hit Enter, create a placeholder assistant message, then reconcile with server ids when the first frame arrives. On failure, keep the user's text (editable), show an inline error on the assistant placeholder, and offer retry. Never lose typed input.

## Showing tool calls and citations

- Render tool calls as a collapsible step ("Searching the knowledge base… 3 results") in the order they arrive, with running, done and failed states. Long-running steps need an elapsed indicator.
- Approval-gated tools (send email, delete) must pause the stream and render an explicit confirm control; the stream resumes only after the server receives the decision.
- Citations arrive attached to spans of text; render a numbered marker inline and a source list under the message with the cited quote. Clicking opens the source with the span highlighted. Fall back to the source list when span data is missing.
- Hide reasoning or "thinking" text by default; if you show a summary, label it clearly as such.

## Accessibility

- Do not announce every token. Put the streaming message in a container the screen reader can reach, and use a separate `aria-live="polite"` region that announces state changes: "Answer started", "Answer complete", "Stopped", "Error". Announce the final text once, or let the user navigate to it.
- Stop button is a real `<button>`, reachable by keyboard, with a visible focus ring; `Escape` is a reasonable shortcut.
- Preserve focus: do not steal focus from the input when frames arrive; do not auto-scroll if the user has scrolled up (track a "pinned to bottom" flag).
- Respect `prefers-reduced-motion`: no typewriter animations or blinking cursors for those users.
- Streamed code blocks need a copy button and a language label.

## Error and empty states

| State | What to show |
|---|---|
| Rate limited (429) | "Busy right now" with an automatic retry countdown using the server's `retry-after` |
| Model refused or filtered | A plain explanation, without implying the user did something wrong; offer to rephrase |
| Retrieval found nothing | "No sources found for this" with the option to ask anyway; never silently answer from memory in a RAG product that promises grounding |
| Timeout mid-stream | Keep the partial, mark it incomplete, offer resume or regenerate |
| Empty conversation | Example prompts, scope ("I can answer questions about your orders"), and what the assistant cannot do |
| Context too long | Explain and offer to start a new conversation; do not truncate silently |

## A small TypeScript client

```ts
type StreamEvent =
  | { type: 'delta'; text: string }
  | { type: 'tool_call'; id: string; name: string; status: 'running' | 'done' | 'failed' }
  | { type: 'citation'; index: number; title: string; url: string }
  | { type: 'done'; messageId: string }
  | { type: 'error'; code: string; retryable: boolean }

export async function streamChat(
  body: { conversationId: string; clientMessageId: string; text: string },
  onEvent: (e: StreamEvent) => void,
  signal: AbortSignal,
  lastEventId?: string,
): Promise<void> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'text/event-stream',
      ...(lastEventId ? { 'last-event-id': lastEventId } : {}),
    },
    body: JSON.stringify(body),
    signal,
  })
  if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`)

  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader()
  let buffer = ''
  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += value
    let sep: number
    while ((sep = buffer.indexOf('\n\n')) !== -1) {
      const frame = buffer.slice(0, sep)
      buffer = buffer.slice(sep + 2)
      const data = frame
        .split('\n')
        .filter((l) => l.startsWith('data:'))
        .map((l) => l.slice(5).trim())
        .join('\n')
      if (data) onEvent(JSON.parse(data) as StreamEvent)
    }
  }
}
```

Using it from React: keep `text` in state, append on `delta`, throttle the markdown render with `requestAnimationFrame`, hold the `AbortController` in a ref, and call `controller.abort()` on Stop and in the effect cleanup. Catch `AbortError` and treat it as a normal stop, not a failure.

## Worked example: a streaming chat message component

```tsx
function useStreamingAnswer() {
  const [text, setText] = useState('')
  const [status, setStatus] = useState<'idle' | 'streaming' | 'done' | 'error' | 'stopped'>('idle')
  const controllerRef = useRef<AbortController | null>(null)

  async function ask(question: string) {
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller
    setText('')
    setStatus('streaming')
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
        signal: controller.signal,
      })
      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`)
      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader()
      let buffer = ''
      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        buffer += value
        const events = buffer.split('\n\n') // SSE events are separated by a blank line
        buffer = events.pop() ?? '' // keep a partial event for the next chunk
        for (const event of events) {
          const data = event.replace(/^data: /, '')
          if (data === '[DONE]') continue
          const delta = JSON.parse(data) as { text?: string }
          if (delta.text) setText((t) => t + delta.text)
        }
      }
      setStatus('done')
    } catch (err) {
      setStatus((err as Error).name === 'AbortError' ? 'stopped' : 'error')
    }
  }

  return { text, status, ask, stop: () => controllerRef.current?.abort() }
}
```

UI behaviour to pair with it:

- Render the text through a markdown renderer that tolerates incomplete syntax and **sanitises** HTML; never `innerHTML` raw model output.
- Show a "Stop" button while streaming; keep the partial text when stopped, marked as incomplete.
- Batch updates per animation frame if tokens arrive faster than the screen refreshes.
- Announce completion (not every token) to screen readers via a polite live region, and keep keyboard focus in the composer.
- On error mid-stream, keep what arrived and offer "Retry", which resends the question rather than resuming.

## Common interview questions

**Why fetch streaming over EventSource or WebSockets for chat?**
Chat is one POST with a long response, so a streaming fetch body gives you auth headers, a JSON body, and cancellation with `AbortController`. `EventSource` is GET-only without custom headers, and WebSockets add connection management you only need when the client must send mid-stream.

**How do you render markdown while it is still arriving?**
Re-parse the accumulated buffer on each frame (throttled), close open constructs provisionally so the layout does not flip, render block by block with stable keys, and sanitise the output because model text is untrusted.

**What happens when the user hits Stop?**
Abort the fetch, propagate the cancellation to the model call on the server to stop spending tokens, keep the partial text marked as stopped, and offer continue or regenerate.

**How do you recover from a dropped connection halfway through?**
Buffer frames server-side under the stream id for a short window, send ids on every frame, and let the client reconnect with the last id to receive only what it missed. If the buffer is gone, offer an explicit regenerate rather than silently re-running.

**How do you make a streaming answer accessible?**
Announce state changes, not tokens, through a polite live region; keep focus where the user put it; make Stop a keyboard-reachable button; disable typewriter effects under reduced motion; announce completion once.

**How do you show tool use without confusing people?**
As collapsible steps with running, done and failed states in arrival order, gated steps rendered as explicit confirmations, and citations as inline markers linked to a source list with the quoted span.

**Where does XSS come in?**
Model output and retrieved documents are untrusted. Never inject raw HTML; render through a markdown parser with sanitisation, allowlist URL schemes, and set `rel="noopener"` on links.

## Pitfalls

- Re-rendering the whole message list on every token.
- Treating each network chunk as one complete event.
- Inserting model output as raw HTML.
- Live regions that read out every token.
- Losing partial output on errors or aborts.

## Key takeaways

- Stream over SSE or fetch with a readable stream; parse events across chunk boundaries.
- Make every request abortable and show a Stop control.
- Render partial markdown safely with sanitisation.
- Batch UI updates and announce completion accessibly, not every token.
- Design explicit states: idle, streaming, done, stopped, error.
