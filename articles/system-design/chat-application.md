---
title: Chat Application
order: 3
summary: Design a real-time messaging client — transport choice, message ids and ordering, delivery states, offline queueing, presence and virtualised history.
---

Chat (Messenger, Slack, WhatsApp Web) tests real-time networking on the client: picking a transport, keeping messages ordered and deduplicated across retries and reconnects, and staying usable offline. The UI itself is simple; the state machine behind each message is the interview.

## Requirements

### Clarifying questions

- One-to-one only, or group conversations / channels? Max group size?
- Message types: text, images, files, reactions, replies/threads, edits, deletes?
- Delivery and read receipts? Typing indicators? Online presence?
- Multiple devices / tabs per user, kept in sync?
- History depth: load everything or paginate? Search?
- Offline support: read old messages, compose while offline?
- End-to-end encryption in scope?

### Functional

- Conversation list with last message, unread count, ordering by recency.
- Message view: send and receive in real time, load older history on scroll up.
- Delivery states: sending, sent, delivered, read; failed with retry.
- Typing indicator and online presence.
- Attachments (images) with upload progress.

### Non-functional

- Low latency: messages appear in well under a second.
- No lost, duplicated or misordered messages, even across reconnects.
- Works on flaky mobile networks and offline (queue and resend).
- Smooth with tens of thousands of messages in a conversation.
- Accessible: new messages announced, keyboard-friendly composer.

## Architecture

```text
+--------------------------------------------------------------------+
| App shell                                                          |
|  +------------------+  +----------------------------------------+  |
|  | ConversationList |  | ConversationView                       |  |
|  |  (unread, last   |  |  Header (name, presence)               |  |
|  |   message, sort) |  |  MessageList (virtualised, reverse)    |  |
|  +--------+---------+  |  TypingIndicator                       |  |
|           |            |  Composer (draft, attachments)         |  |
|           |            +-------------------+--------------------+  |
+-----------|--------------------------------|-----------------------+
            v                                v
   +-------------------------------------------------------+
   | Client store: conversations, messages by conv,         |
   | outbox, presence, cursors                              |
   +-----------+-------------------------+------------------+
               |                         |
     +---------v---------+     +---------v-----------+
     | Sync / transport  |     | Persistence          |
     | WebSocket manager |     | IndexedDB (history,  |
     | reconnect, acks,  |     | outbox, drafts)      |
     | heartbeats        |     +----------------------+
     +---------+---------+
               |
     wss://chat.example.com  +  REST for history and uploads
```

- **Transport manager**: one WebSocket per tab (or shared via a `SharedWorker`/leader tab), reconnect with backoff, heartbeats, resume from last seen sequence.
- **Outbox**: queue of unsent messages, persisted, flushed on reconnect.
- **Store**: normalised, keyed by conversation; the UI subscribes to slices.
- **Persistence**: IndexedDB for history and outbox so reloads and offline work.

## Data model

```ts
type Message = {
  id: string                 // server id, assigned on ack
  clientId: string           // generated on the client (UUID) for idempotency and matching acks
  conversationId: string
  senderId: string
  seq?: number               // server-assigned, monotonically increasing per conversation
  body: { type: 'text'; text: string } | { type: 'image'; url: string; width: number; height: number }
  createdAt: string          // client time, for display while pending
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed'
  replyToId?: string
  editedAt?: string
}

type Conversation = {
  id: string
  title: string
  memberIds: string[]
  lastMessageId?: string
  lastReadSeq: number
  unreadCount: number
  oldestLoadedSeq?: number   // for paginating history upwards
}

type ChatState = {
  conversations: Record<string, Conversation>
  conversationOrder: string[]
  messages: Record<string, Message[]>     // sorted by seq, pending at the end
  outbox: Message[]
  presence: Record<string, { online: boolean; lastSeen?: string }>
  typing: Record<string, string[]>        // conversationId -> userIds
  connection: 'connecting' | 'open' | 'reconnecting' | 'offline'
}
```

## Interface

### Transport choice

| | Short polling | Long polling | SSE | WebSocket |
|---|---|---|---|---|
| Direction | Client pulls | Client pulls, server holds | Server to client | Bidirectional |
| Latency | Poll interval | Low | Low | Lowest |
| Overhead | High (many requests) | Medium | Low | Lowest per message |
| Infra | Plain HTTP | Plain HTTP | HTTP, auto-reconnect, `Last-Event-ID` | Sticky connections, special LB/proxy config |
| Fit for chat | Fallback only | Fallback | Receiving + POST to send works | Standard choice |

Choose WebSocket for chat (frequent two-way traffic: messages, typing, receipts). SSE + HTTP POST is a respectable alternative with simpler infrastructure. Keep long polling as a fallback for hostile networks.

### Events over the socket

```json
{ "type": "message.send", "clientId": "c-7f3e", "conversationId": "cv_1", "body": { "type": "text", "text": "hi" } }
{ "type": "message.ack", "clientId": "c-7f3e", "id": "m_981", "seq": 1042, "createdAt": "2026-11-16T10:00:01Z" }
{ "type": "message.new", "message": { "id": "m_982", "seq": 1043, "...": "..." } }
{ "type": "receipt", "conversationId": "cv_1", "userId": "u_2", "readUpToSeq": 1042 }
{ "type": "typing", "conversationId": "cv_1", "userId": "u_2" }
{ "type": "presence", "userId": "u_2", "online": false, "lastSeen": "..." }
{ "type": "sync", "conversationId": "cv_1", "afterSeq": 1030 }
```

### REST

```text
GET  /api/conversations?cursor=...
GET  /api/conversations/:id/messages?beforeSeq=1000&limit=50   (history, paginate upward)
GET  /api/conversations/:id/messages?afterSeq=1030             (catch up after reconnect)
POST /api/uploads -> presigned URL
```

## Optimisations

### Ordering and ids

- The client creates `clientId` before sending: it renders the message immediately, and the server uses it to **deduplicate retries** (idempotency key).
- The server assigns `seq` per conversation; the client sorts by `seq`, not client timestamps (clocks drift).
- On `message.new`, insert by `seq`; ignore if the id is already present.
- Gap detection: if `seq` jumps (received 1045 after 1042), request `afterSeq=1042`.

### Delivery states

```text
pending --ack--> sent --recipient device got it--> delivered --recipient viewed--> read
   |
   +--timeout / socket closed--> failed --user taps retry or auto retry--> pending
```

- Read receipts are sent as "read up to seq N", not per message.
- Send them when the message is actually visible and the tab is focused (`IntersectionObserver` + `document.visibilityState`).

### Offline queue

- Messages composed offline go to the outbox (persisted in IndexedDB) with status `pending`.
- On reconnect: authenticate, sync missed messages (`afterSeq`), then flush the outbox **in order** with the same `clientId`s.
- Exponential backoff with jitter for reconnects; listen to `online`/`offline` events as hints, not truth.
- Heartbeats (ping/pong every ~30 s) detect dead connections that never fired `close`.

### Presence and typing

- Typing: send `typing` at most every ~3 s while typing; recipients expire the indicator after ~5 s without another event.
- Presence: server derives online state from live connections + heartbeats; fan out changes only to contacts or open conversations. Batch and throttle updates in large groups.

### Virtualised history

- Reverse-scrolling list anchored to the bottom; load older pages when the top sentinel is visible.
- When prepending older messages, **preserve scroll position** by adjusting `scrollTop` by the added height (or use `flex-direction: column-reverse`).
- Only auto-scroll to new messages if the user is already near the bottom; otherwise show "New messages" jump button.
- Variable heights: measure and cache by message id; reserve image dimensions.

### Multiple tabs and devices

- Avoid N sockets for N tabs: elect a leader tab (Web Locks API) or use a `SharedWorker`, broadcast to others with `BroadcastChannel`.
- Unread counts and read state sync from the server so all devices agree.

### Accessibility

- Message list as `role="log"` (implicitly `aria-live="polite"`), so new messages are announced without stealing focus.
- Composer: labelled textarea, Enter sends, Shift+Enter newline, announced send failures.
- Each message has sender and time in its accessible text; status icons have text alternatives.

### Security and i18n

- Render message text as text (no `innerHTML`); sanitise any markdown; scan links.
- Authenticate the socket (token in first message or cookie; not in the URL query where it can be logged).
- E2E encryption (Signal protocol) if required: keys on device, server stores ciphertext; search becomes client-side.
- Unicode and emoji handling, RTL text with `dir="auto"`, localised timestamps.

## Deep-dive questions

**Why WebSocket rather than SSE for chat?**
Chat sends frequent small messages both ways (messages, typing, receipts). WebSocket gives one low-overhead full-duplex channel. SSE + POST works too but costs a request per sent event.

**How do you avoid duplicate messages on retry?**
Every message carries a client-generated id; the server treats it as an idempotency key and acks with the same id, so a retry maps to the existing message.

**How do you guarantee ordering?**
Order by server-assigned per-conversation sequence numbers, insert by seq, and detect gaps to trigger a catch-up fetch. Client timestamps are only for display of pending messages.

**What happens when the connection drops mid-send?**
The message stays pending in the persisted outbox; after reconnect and catch-up sync, it's resent with the same client id. After repeated failures it's marked failed with a retry action.

**How do you keep scroll position when loading older messages?**
Measure scroll height before prepending, then set `scrollTop += newHeight - oldHeight` after render (in a layout effect).

**How would you implement presence at scale?**
Server tracks connections with heartbeats and a TTL; clients subscribe only to relevant users; updates are batched and throttled; "last seen" is coarse to reduce churn.
