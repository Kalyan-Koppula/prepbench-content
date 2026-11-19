---
title: Collaborative Editor
order: 6
summary: Design a real-time collaborative document editor — OT vs CRDT, presence and remote cursors, conflict handling, persistence, offline editing and undo.
---

The hardest common frontend design prompt (Google Docs, Notion, Figma). Nobody expects you to implement OT or a CRDT in 45 minutes; they expect you to explain **why naive syncing fails**, compare the two families at a high level, and design the client around a local-first document model with presence, persistence and per-user undo.

## Requirements

### Clarifying questions

- Document type: rich text, a block-based doc (Notion), a whiteboard/canvas, or a spreadsheet?
- How many concurrent editors per document (5, 50, 500)? How many viewers?
- Offline editing required? How long offline (minutes vs days)?
- Comments, suggestions mode, version history?
- Permissions: view, comment, edit? Share links?
- Do we own the backend, or must it work peer-to-peer?

### Functional

- Multiple users edit the same document simultaneously; everyone converges to the same content.
- See collaborators' presence: avatars, cursors and selections, with names and colours.
- Autosave; reopen and see the latest version; version history.
- Undo/redo of your own changes.
- Offline edits merged on reconnect.

### Non-functional

- Local edits apply instantly (no waiting for the server).
- Convergence: all replicas reach the same state regardless of message order.
- Intent preservation: concurrent edits keep what each user meant.
- Low bandwidth (send operations, not whole documents); handle large docs.
- Durable: no lost edits on crash or tab close.
- Accessible editor (a real challenge with `contenteditable`).

## Architecture

```text
+--------------------------------------------------------------------+
| Editor UI                                                          |
|  Toolbar   PresenceBar (avatars)   CommentsSidebar                 |
|  +--------------------------------------------------------------+  |
|  | EditorView (ProseMirror / Lexical / Slate / TipTap)          |  |
|  |  renders doc, captures input -> transactions                 |  |
|  |  RemoteCursorsLayer (decorations)                            |  |
|  +-------------------------------+------------------------------+  |
+----------------------------------|---------------------------------+
                                   | local ops / remote ops
+----------------------------------v---------------------------------+
| Sync engine                                                        |
|  Document model (OT client state or CRDT doc, e.g. Yjs)            |
|  UndoManager (tracks local-origin ops only)                        |
|  Awareness (ephemeral presence: cursor, selection, user)           |
+-----------+-----------------------------+--------------------------+
            |                             |
   +--------v--------+           +--------v--------------+
   | Local persistence|           | Transport             |
   | IndexedDB (doc   |           | WebSocket to collab   |
   | updates, queue)  |           | server (rooms per doc)|
   +------------------+           +--------+--------------+
                                           |
                       Collab server: auth, relay/transform ops,
                       snapshot + op log storage, history
```

## Why naive approaches fail

- **Last write wins on the whole document**: concurrent edits overwrite each other.
- **Locking** (one editor at a time / per paragraph): safe but kills the "simultaneous" requirement.
- **Sending index-based ops as-is**: Alice inserts at 0 while Bob deletes at 5; applying Bob's delete after Alice's insert hits the wrong character. Positions must be transformed or made position-independent.

## OT vs CRDT

**Operational Transformation (OT)**: operations are index-based (`insert(5, "x")`, `delete(3, 2)`). When concurrent operations meet, a transform function adjusts one against the other so both orders produce the same result. A central server establishes a total order and transforms incoming ops against those already applied.

**CRDT (Conflict-free Replicated Data Type)**: each character/element gets a globally unique, ordered id (e.g. client id + counter) and inserts reference neighbours by id, not index. Merge is commutative, associative and idempotent, so replicas converge regardless of delivery order, without a central authority.

| | OT | CRDT |
|---|---|---|
| Positions | Indices, transformed | Unique ids, no transformation |
| Server | Central server required for ordering | Optional; peer-to-peer possible; server is a relay + storage |
| Offline | Long offline sessions are hard (large transform chains) | Natural: merge whenever reconnected |
| Metadata overhead | Low | Higher (ids, tombstones), mitigated by modern encodings and GC |
| Complexity | Transform functions are notoriously hard to get right for rich types | Data structure complexity; libraries hide it |
| Examples | Google Docs (historically), ShareDB, CodeMirror collab | Yjs, Automerge, Loro; used by many modern editors |

Interview-ready recommendation: **use an established library** (Yjs with a ProseMirror/TipTap/Lexical binding) for a new product; choose OT if you already run a central server and need minimal document overhead and no long offline periods.

## Data model

```ts
// Persistent, replicated document (CRDT via Yjs)
const ydoc = new Y.Doc()
const content = ydoc.getXmlFragment('content')   // rich text bound to the editor
const comments = ydoc.getMap<Comment>('comments') // anchored with relative positions

// Ephemeral presence (not persisted)
type AwarenessState = {
  user: { id: string; name: string; color: string }
  cursor?: { anchor: RelativePosition; head: RelativePosition }
  lastActive: number
}

// Client-side app state
type EditorAppState = {
  docId: string
  connection: 'connecting' | 'synced' | 'offline' | 'reconnecting'
  pendingLocalUpdates: number         // not yet acknowledged by server
  peers: Record<number, AwarenessState>
  permissions: 'view' | 'comment' | 'edit'
}
```

Cursors and comment anchors use **relative positions** (anchored to element ids) so they stay attached to the right text as others edit.

## Interface

```text
GET  /api/docs/:id                -> metadata, permissions
GET  /api/docs/:id/snapshot       -> latest snapshot (binary or JSON) for fast initial load
WSS  /collab?doc=:id              -> sync protocol (binary messages)
GET  /api/docs/:id/versions       -> named versions / history
POST /api/docs/:id/versions       -> create named version
```

Sync protocol over WebSocket (Yjs-style):

1. Client sends its **state vector** (what it has seen).
2. Server replies with the **missing updates**; client sends what the server is missing.
3. Afterwards both stream incremental updates; server broadcasts to the room and appends to storage.
4. Awareness messages (cursor, user) are broadcast separately and expire when a client goes quiet (~30 s).

WebSocket because traffic is high-frequency and bidirectional. WebRTC peer-to-peer is possible with CRDTs but you still need a server for persistence, auth and NAT traversal.

## Optimisations

### Presence and cursors

- Throttle cursor/selection broadcasts (e.g. every 50–100 ms) and send only on change.
- Render remote cursors as decorations/overlays (not document content) with name labels and assigned colours.
- Hide idle cursors; collapse avatars beyond N users ("+5").
- Follow mode: scroll to a collaborator's cursor.

### Conflict handling

- Character-level conflicts are resolved by the algorithm; the UI only needs to keep the local cursor stable (map selection through remote changes).
- Semantic conflicts (two people rename the same heading) converge deterministically but may surprise; surface them via presence ("Bob is editing this") rather than blocking.
- Permissions changes mid-session: server rejects updates from read-only users; client switches to read-only mode.
- Schema validation: reject or repair updates that would produce an invalid document (e.g. a table cell outside a table).

### Persistence and durability

- Local first: write every update to IndexedDB (`y-indexeddb`) before or while sending, so a crash or tab close loses nothing.
- Server: append-only update log plus periodic **snapshots/compaction** so loading doesn't replay millions of ops.
- Initial load: server-rendered or fetched snapshot for fast first paint (read-only), then attach the live sync.
- Show save status ("Saving...", "All changes saved", "Offline, changes saved on this device").
- Warn on `beforeunload` only when updates are unacknowledged and not persisted locally.

### Offline

- Keep editing against the local CRDT; queue updates; merge on reconnect via the state-vector handshake.
- After long offline periods, show who changed what (highlights or a diff) since merges may be surprising.

### Undo/redo

- Undo must be **per user**: undoing shouldn't revert a collaborator's typing. Track only local-origin transactions (Yjs `UndoManager` with tracked origins; OT systems invert the op and transform it against later remote ops).
- Group keystrokes into undo steps by time (e.g. 500 ms) or word boundaries.
- Undo restores the selection as well as content.

### Performance

- Large docs: virtualise rendering of off-screen blocks or paginate (careful with `contenteditable` and find-in-page).
- Batch remote updates per animation frame; avoid re-rendering the whole document on each op.
- Binary update encoding; compress over the wire; garbage-collect tombstones where history isn't needed.
- Lazy load heavy blocks (embeds, code highlighting, diagrams).

### Accessibility

- Editors built on `contenteditable` must keep a sensible accessibility tree: semantic headings and lists, `role="textbox"` with `aria-multiline`, labelled toolbar (`role="toolbar"` with roving tabindex).
- Keyboard shortcuts for all formatting; discoverable shortcut help.
- Announce collaborator joins/leaves politely and sparingly; remote cursors must not be announced continuously.
- Support IME composition: don't apply remote updates in the middle of a composition in a way that breaks it.

### Security and i18n

- Authenticate the socket and authorise per document on every update server-side.
- Sanitise pasted HTML; embeds in sandboxed iframes; CSP.
- Bidirectional text, combining characters and grapheme clusters (use the editor framework's handling, not naive string indices).

## Running the interview

A 45-minute plan for this question:

| Minutes | Focus |
| --- | --- |
| 0–5 | Requirements: document type, number of collaborators, offline, history, permissions |
| 5–12 | Architecture: editor view, document model, sync engine, transport, persistence |
| 12–20 | Why naive syncing fails; OT versus CRDT |
| 20–35 | Deep dives: concurrent edits, presence and cursors, offline merge, undo |
| 35–45 | Performance, durability, accessibility and security |

## Core implementation sketch

With a CRDT library such as Yjs, the client wiring is small; the library handles merging:

```ts
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { IndexeddbPersistence } from 'y-indexeddb'

const doc = new Y.Doc()
const text = doc.getText('body') // a shared, mergeable text type

new IndexeddbPersistence(`doc-${docId}`, doc) // offline: edits persist locally
const provider = new WebsocketProvider(SYNC_URL, docId, doc) // syncs updates with peers via the server

provider.awareness.setLocalStateField('user', { name: me.name, color: me.color }) // presence and cursors

text.observe((event) => {
  // re-render, or let an editor binding (ProseMirror, CodeMirror, Monaco) apply the delta
})

text.insert(0, 'Hello') // local edit: applied immediately, broadcast as a compact update
```

Why it converges: every inserted character gets a unique id (client id plus a counter) and a reference to its neighbour at insertion time. Concurrent inserts at the same spot are ordered deterministically by id, so every replica that has received the same set of updates shows the same text, in any delivery order. Deletions mark characters as removed ("tombstones"), which the library compacts over time.

## Trade-offs to state explicitly

| Decision | Option A | Option B | Choose by |
| --- | --- | --- | --- |
| Merge algorithm | OT (central server transforms ops) | CRDT (merge anywhere) | OT for server-centric systems; CRDT for offline and peer-to-peer |
| Transport | WebSocket | WebRTC between peers | WebSocket through a server for reliability and access control |
| Persistence | Store every op | Snapshots + recent updates | Snapshots bound load time; keep updates for history |
| Undo | Global | Per user, only own changes | Per-user undo is what people expect |

## Deep-dive questions

**Explain OT vs CRDT in two sentences.**
OT sends index-based operations and transforms concurrent ones against each other, usually via a central server that orders them. CRDTs give every element a unique id so operations commute and replicas converge in any order, which suits offline and peer-to-peer.

**Why can't you just send the whole document on every change?**
Concurrent edits overwrite each other and bandwidth grows with document size. You need operation-level sync with a convergence algorithm.

**How do remote cursors stay in the right place?**
Store them as relative positions anchored to element ids, and map local selections through incoming changes.

**How does undo work with multiple users?**
Each client keeps its own undo stack containing only its local operations; undo applies their inverse, adjusted for later remote changes, so others' work is untouched.

**How do you guarantee no data loss?**
Persist updates locally before acknowledging to the user, send them to the server which appends to a durable log, retry until acknowledged, and snapshot periodically.

**What changes for 500 simultaneous editors?**
Throttle and sample presence, shard rooms across servers with a pub/sub layer, compact update logs aggressively, and limit visible cursors and avatars.

## Key takeaways

- Last-write-wins and locking don't work for real-time co-editing; use OT or CRDTs.
- CRDTs converge regardless of delivery order and support offline editing; OT relies on a central server.
- Apply local edits immediately and sync compact updates in the background.
- Presence (cursors, selections) is ephemeral state, separate from the document.
- Plan persistence with snapshots, per-user undo, permissions checks on the server, and accessible editing.
