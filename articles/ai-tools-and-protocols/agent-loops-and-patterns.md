---
title: Agent Loops and Patterns
order: 5
summary: The basic loop with stop conditions and budgets, ReAct vs planner/executor, subagents and fan-out, context management, human-in-the-loop, A2A and Agent Skills in relation to MCP, observability, and the "should this be an agent" checklist.
---

An agent is a loop: the model picks an action, your code runs it, the result goes back in, repeat until a stop condition. Everything else (planners, subagents, memory, protocols) is a pattern layered on that loop. Interviewers ask about agents to see whether you can keep one under control.

## Workflows vs agents

The useful distinction: a **workflow** is LLM calls orchestrated by code you wrote (fixed steps); an **agent** lets the model decide the next step from tool results. Workflow patterns worth naming:

| Pattern | Shape | Use |
|---|---|---|
| Prompt chaining | Step 1 output feeds step 2, with code checks between | Decomposable tasks, accuracy over latency |
| Routing | Classify, then send to a specialised prompt or cheaper model | Mixed traffic |
| Parallelisation | Independent calls at once (sectioning) or the same call several times (voting) | Guardrail plus answer; consensus on risky decisions |
| Orchestrator-workers | A model splits work dynamically and synthesises worker results | Multi-file changes, research |
| Evaluator-optimiser | Generate, grade, revise in a loop | Tasks with clear criteria |

Start with the simplest thing that passes the eval. Agents cost more, take longer and compound errors.

## The basic loop

```ts
async function runAgent(task: string, budget = { steps: 25, tokens: 200_000, ms: 120_000 }) {
  const messages: MessageParam[] = [{ role: "user", content: task }];
  const started = Date.now();
  let spent = 0;

  for (let step = 0; step < budget.steps; step++) {
    if (spent > budget.tokens || Date.now() - started > budget.ms) return stop("budget");

    const res = await llm.create({ model, system, tools, messages, max_tokens: 8192 });
    spent += res.usage.input_tokens + res.usage.output_tokens;
    messages.push({ role: "assistant", content: res.content });

    if (res.stop_reason === "end_turn") return finish(res);
    if (res.stop_reason === "max_tokens") return stop("truncated");
    if (res.stop_reason === "refusal") return stop("refused");
    if (res.stop_reason !== "tool_use") return stop(res.stop_reason);

    const calls = res.content.filter((b) => b.type === "tool_use");
    for (const c of calls) if (needsApproval(c) && !(await approve(c))) return stop("denied");
    const results = await Promise.all(calls.map((c) => runTool(c, { timeoutMs: 30_000 })));
    messages.push({ role: "user", content: results });
  }
  return stop("max_steps");
}
```

Stop conditions, in order of preference: the model says it is done; a verifier (tests pass, schema validates) says it is done; a budget trips; a human denies an action. Every exit path returns a typed outcome, and every step is traced (below).

Loop-signature detection is cheap and worth adding: if the same tool is called with the same arguments three times, break.

## ReAct vs planner/executor

- **ReAct** (reason, act, observe): the model interleaves a short thought, a tool call and the observation, deciding one step at a time. Robust to surprises, easy to implement (it is the basic loop), but it can wander and spend tokens re-deciding.
- **Planner/executor**: the model first produces a plan (ordered steps, sometimes as structured output), then an executor runs each step, possibly with a cheaper model, and a replanning call handles failures. More predictable and cheaper per step, easier to show to a human for approval, worse when the plan is wrong early.
- In practice: ReAct with a planning prompt at the start ("outline the steps, then begin") and re-planning on failure covers most cases. Modern reasoning models do much of the planning in their thinking tokens.

## Subagents and fan-out

A subagent is a fresh context with its own system prompt, tools and budget, given a narrow task, returning a summary. Reasons to use them:

- Context isolation: a search across fifty files should not fill the parent's window with file contents; the child reads, the parent gets conclusions.
- Parallelism: independent subtasks (one per repository, per document, per test shard) run concurrently.
- Specialisation and cheaper models for bounded work.

Costs: two hand-offs lose detail (the brief going in, the summary coming out), the parent cannot see what the child skipped, and N children spend tokens in a burst. Rules: write the brief as you would for a peer (goal, what is known, where to look, scope), cap child budgets, and never let a child spawn unboundedly. Fan-out then fan-in with a synthesis step is the orchestrator-workers pattern.

## Memory and context management

The context window fills with tool results, most of which are stale after one step. Options, roughly in order of adoption:

1. **Clear old tool results**: replace the content of tool results older than N steps with a placeholder; keep the calls so the history still makes sense. Some APIs do this server-side.
2. **Compaction**: summarise the earlier conversation into a compact block when the context crosses a threshold; keep recent turns verbatim. Server-side compaction exists on some APIs; otherwise you write the summariser. Keep the summary block in the history on later turns.
3. **Externalise state**: write progress notes, plans and findings to a file or memory tool, and read them back. This also survives across sessions.
4. **Retrieval instead of inclusion**: give the agent a search tool over large material rather than pasting it.
5. **Prompt caching** for the stable prefix (system prompt, tools) so re-reading history is cheap.

Say "context rot" out loud: quality drops as the window fills, so the goal is the smallest working set, not the biggest window.

## Human-in-the-loop

Approval is a stop condition, not an afterthought. Classify tools by side effect (read-only, reversible, irreversible), auto-run the first class with output limits, log the second, and block on the third with the exact arguments shown. For long tasks, add checkpoints where the agent summarises progress and waits. Hosted agent platforms expose this as permission policies (always allow, always ask, or a classifier that decides and pauses when unsure); coding agents expose it as permission prompts and allow-rules.

## A2A: agent-to-agent

The Agent2Agent protocol (A2A), a Linux Foundation project at v1.0, standardises how one agent talks to another opaque agent. Each agent publishes an **Agent Card** (identity, endpoint, supported bindings, `securitySchemes`, skills); a client sends **messages** made of **parts** (text, data, files) and gets back a **task** with a lifecycle (`SUBMITTED`, `WORKING`, `INPUT_REQUIRED`, `AUTH_REQUIRED`, then `COMPLETED`, `FAILED`, `CANCELED` or `REJECTED`) that yields **artifacts**; results stream over SSE or arrive by push notification; bindings include JSON-RPC, gRPC and HTTP+JSON. A2A's own framing of the relationship to MCP: MCP connects an agent to its tools and data (vertical), A2A connects agents to each other (horizontal); its example is a shop-manager agent delegating to a mechanic agent over A2A while the mechanic uses MCP for its diagnostic tools. In an interview, position A2A as the protocol you reach for when the other party is a long-running, stateful agent you do not control, and MCP (or a plain tool) when it is a function.

## Agent Skills

A Skill is a folder with a `SKILL.md` (YAML frontmatter `name` and `description`, then instructions) plus optional scripts and reference files. Only the name and description are loaded up front; the body loads when the task matches, and bundled files load only if referenced, so many skills cost little context. Skills run where the agent has a file system and shell: Claude Code (`~/.claude/skills/`, `.claude/skills/`), the API via a code-execution container, and claude.ai; the format is also published as an open standard. Relationship to MCP: MCP gives an agent **capabilities** (tools, data); Skills give it **procedures** (how to use those capabilities for a task, with scripts for the deterministic parts). An MCP extension ("Skills over MCP") lets servers ship skills alongside tools. Treat third-party skills like installing software: they can direct the agent to call tools in ways their description does not suggest.

## Observability

Trace every step with a span: model, prompt version, input and output tokens, cache hits, latency, stop reason, each tool call with arguments (redacted), duration and error, approval decisions, and budget consumed. Propagate a trace id through tool calls (MCP defines `traceparent` in `_meta` for exactly this). Store full transcripts for failed runs. Dashboards: cost per task, steps per task, tool error rate, approval denial rate, and the distribution of stop reasons. Without this you cannot debug a bad run or justify an agent's cost.

## Should this even be an agent?

Ask all four before building one:

1. **Is the path unknowable in advance?** If you can write the steps as code, write a workflow.
2. **Does the value cover the cost?** Agents are 5–50x the tokens and latency of a single call.
3. **Can the model actually do the task?** Prototype one hard case by hand first.
4. **Can errors be caught and undone?** Tests, review, sandboxes, rollback. If not, keep a human in the loop or do not automate it.

A "no" on any of them means a single call or a workflow. Most production LLM features are not agents.

## Common interview questions

**What is an agent, precisely?**
A loop in which the model chooses the next action from available tools, the application executes it and feeds the result back, until the model finishes, a verifier passes, a budget trips or a human stops it. The model directs the control flow; in a workflow the code does.

**How do you keep an agent from running forever or spending too much?**
Hard caps on steps, tokens and wall-clock in the loop, timeouts per tool call, detection of repeated identical calls, and an explicit typed outcome for every exit path. Advisory budgets the model can see help it finish gracefully but do not replace the enforced stop.

**ReAct or planner/executor?**
ReAct for open-ended tasks where surprises are common; planner/executor when steps are predictable, cheaper models can execute them, or a human should approve the plan. In practice a ReAct loop that plans first and replans on failure covers most needs.

**When do subagents help and when do they hurt?**
They help when a subtask would flood the parent's context or when subtasks are independent and can run in parallel. They hurt when the brief or the summary loses detail that mattered, or when fan-out is unbounded; cap budgets and write briefs carefully.

**How do you manage context in a long-running agent?**
Clear stale tool results, compact older history into a summary block, externalise plans and findings to files or a memory tool, prefer retrieval over inclusion, and cache the stable prefix. The target is the smallest working set that still lets the model act.

**How do A2A and Agent Skills relate to MCP?**
MCP connects an agent to tools and data; A2A connects an agent to other agents through agent cards, tasks and artifacts; Skills package procedures and scripts the agent loads on demand to use those tools well. They layer rather than compete.

**What would you trace in an agent run?**
Per step: model and prompt version, tokens and cache hits, latency, stop reason, every tool call with redacted arguments and outcome, approvals, and remaining budget, all linked by a trace id that flows into tool calls. Aggregate into cost per task and tool error rate.

**When should you not build an agent?**
When the steps can be written as code, when the task's value does not cover the extra cost and latency, when the model cannot reliably do a hard case, or when errors cannot be caught and undone. In those cases a single call or a workflow is the right answer.
