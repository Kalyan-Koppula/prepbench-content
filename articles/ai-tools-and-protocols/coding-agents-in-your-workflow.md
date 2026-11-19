---
title: Coding Agents in Your Workflow
order: 6
summary: How Claude Code, Cursor and similar tools work (loop, tools, permissions), project instruction files, skills, MCP in the IDE, reviewing agent output, and how to talk about them in an interview without sounding like you outsource thinking.
---

Interviewers in 2026 assume you use a coding agent. The question is whether you can explain what it does, how you keep it safe and honest, and how you stay the engineer in the loop. Vague enthusiasm reads badly; specifics read well.

## How they work

Every coding agent is the same loop from the previous article with a fixed tool set:

- **Tools**: read, write and edit files; search (grep and glob); run shell commands; fetch URLs; sometimes a browser; plus anything added through MCP.
- **Loop**: the model reads your request and the project instructions, calls tools to explore, edits, runs tests, reads the output, and iterates until it believes it is done or you stop it.
- **Permissions**: each side-effecting tool call is checked against a policy. Claude Code uses allow and deny rules (per tool, per command prefix, per path) plus interactive prompts; Cursor uses run modes with allow-lists and a classifier for ambiguous commands. Hooks can block a call regardless of what the model decides.
- **Context management**: long sessions get compacted automatically; subagents handle searches so file dumps stay out of the main context.

The differences between products are mostly in the harness (IDE integration, permission UX, background tasks), not in the model loop.

## Project instruction files

Claude Code reads `CLAUDE.md` (or an existing `AGENTS.md`) at the start of every session; Cursor has rules files; most tools now honour `AGENTS.md`. What belongs there is what a new engineer would need on day one and could not discover by reading the code:

- Build, test and lint commands, and which to run before declaring done.
- Conventions that are not enforced by tooling (naming, module layout, commit style).
- Things not to touch, and why.
- Where the design docs are.

Mechanics worth knowing for Claude Code: managed (org-wide) file, then `~/.claude/CLAUDE.md`, then project `CLAUDE.md` or `.claude/CLAUDE.md` from the working directory and every parent, then `CLAUDE.local.md` for gitignored personal notes; subdirectory files load when the agent touches that directory; `@path` imports pull in other files; `.claude/rules/*.md` with a `paths:` frontmatter scope instructions to matching files. Keep each file under about 200 lines, since every line costs context on every turn and long files reduce adherence. `/init` drafts one from the codebase. Instructions are context, not enforcement: to actually block something, use a permission rule or a pre-tool hook.

## Permissions in practice

A project `.claude/settings.json` turns intent into enforcement:

```json
{
  "permissions": {
    "allow": ["Bash(npm test *)", "Bash(npm run lint *)", "Read", "Edit"],
    "deny": ["Bash(git push *)", "Bash(rm -rf *)", "Edit(./migrations/**)", "Read(./.env)"]
  }
}
```

Allow rules let routine commands run without a prompt; deny rules block regardless of what the model argues; anything else prompts. Pair them with a pre-tool hook for checks that need logic (for example, refusing edits while the working tree has unrelated changes). The point to make in an interview: the agent's autonomy is a policy you wrote, not a property of the model.

## Skills

A skill is a `SKILL.md` with `name` and `description` frontmatter plus a body of procedure, optionally with scripts and reference files alongside. Only the description is in context until the skill is invoked (by you with `/name` or by the model when the task matches), so skills are where long procedures live and `CLAUDE.md` is where short facts live. Frontmatter options let you restrict a skill to user invocation only (for deploys), pre-approve specific tools for its turn, run it in a forked subagent, or scope it to file paths. Share them by committing `.claude/skills/` or through plugins. The format follows the open Agent Skills standard, so the same folder works in the API's code-execution environment.

## MCP in the IDE

MCP is how the agent reaches things outside the repo: issue trackers, design tools, databases, browsers, documentation, internal APIs.

```bash
claude mcp add --transport http linear https://mcp.linear.app/mcp   # remote, OAuth via /mcp
claude mcp add db -- npx -y my-db-server --readonly                  # local stdio
```

Project-scoped servers go in a committed `.mcp.json` (teammates approve them on first use); personal ones in user scope. Tools show up as `mcp__<server>__<tool>` for permission rules. Practical rules: prefer read-only servers or read-only modes, expand `${ENV}` references rather than committing secrets, keep tool lists small (tool search defers large lists but descriptions still matter), and watch output size since hosts truncate at a token limit. Cursor's `.cursor/mcp.json` and Claude Desktop's config follow the same shape.

## Reviewing agent output

The agent is a fast junior with no memory of yesterday and no stake in production. Review accordingly:

- **Read the diff, not the summary.** The summary is what the model believes it did.
- **Run the tests yourself**, and check the agent did not weaken them (deleted assertions, broadened mocks, skipped cases).
- **Look for scope creep**: unrelated refactors, new dependencies, changed config, "helpful" formatting churn.
- **Check the edges**: error paths, concurrency, auth, anything the happy-path test does not cover.
- **Verify claims about the codebase** ("there is no existing helper for this") with a grep.
- **Watch for injection**: an agent that reads issues, PR descriptions or web pages can be steered by them. Keep write and push permissions gated.
- Small, reviewable tasks produce better output than "implement the feature". Ask for a plan first on anything non-trivial, approve it, then let it execute.

Keep a note of recurring mistakes and turn them into `CLAUDE.md` lines or rules; that is how the tool improves for the whole team.

## Working patterns that hold up

- Explore first: ask it to map the relevant code and explain the current behaviour before changing anything.
- Test-first for bug fixes: have it write the failing test, confirm it fails, then fix.
- Use subagents or forked skills for research so the main session stays focused.
- Commit often; let the agent work on a branch or a worktree; never give it production credentials.
- Pair it with CI: the agent's PR goes through the same lint, test and review gates as anyone's.
- Measure: time saved, defects escaped, review load. If reviewing its output costs more than writing the code, the task was wrong for it.

## Worked example: a feature with a coding agent, end to end

Task: add CSV export to an admin table.

1. **Plan first.** Ask the agent to read the relevant code and propose a plan without editing: which files, which endpoint, how large exports are streamed, which tests. Review and adjust the plan (for example: "use the existing `ExportService`, don't add a new library").
2. **Give it the project's rules.** The instruction file (`CLAUDE.md`, `AGENTS.md` or similar) already says how to run tests and lint, the code style, and "never commit secrets". Add task-specific constraints in the prompt.
3. **Let it work in small steps** with tests: write the failing test for the CSV format, implement, run the test suite, fix.
4. **Review like a colleague's pull request.** Read the diff line by line. Typical issues to look for: missing escaping of commas and quotes in CSV cells, loading all rows into memory instead of streaming, no authorisation check on the new endpoint, tests that assert on the implementation rather than behaviour.
5. **Ask for fixes with specifics** ("stream rows with a cursor; add a test with a cell containing a quote and a newline"), then re-review.
6. **Verify yourself.** Run the app, download a CSV with awkward data, open it in a spreadsheet.

What made it work: a reviewed plan, project rules the agent reads every time, tests as the feedback loop, and a human reviewing the result with the same standards as any other change.

## Talking about it in an interview

What sounds like outsourcing thinking: "I just ask Claude to build the feature", "it writes my tests", "I don't really read the output". What sounds like an engineer:

- "I use it for exploration, boilerplate, migrations and first drafts; I design the approach and review every diff."
- "I keep a `CLAUDE.md` with our commands and conventions, and rules that block it from touching migrations without approval."
- "I wired our issue tracker and a read-only database server over MCP so it can check the ticket and the schema before editing."
- "I ask for a plan on anything bigger than a bug fix and approve it before it runs; the PR goes through normal review."
- "The failure mode I watch for is weakened tests and confident wrong claims about the codebase, so I grep and run things myself."
- Have one concrete story: a task it did well, a task it got wrong, and what you changed afterwards.

Interviewers are checking that you understand the loop, you control the permissions, you own correctness, and you can explain the limits.

## Common interview questions

**How does a coding agent actually work?**
It is a model in a loop with file, search, shell and fetch tools, plus MCP servers you add. It reads your request and the project instructions, explores with tools, edits, runs tests, reads results and iterates; a permission policy decides which tool calls run automatically and which need your approval.

**What do you put in `CLAUDE.md`?**
Build and test commands, conventions tooling does not enforce, what not to touch and why, and pointers to design docs, kept short because it is loaded on every turn. Long procedures go in skills, and hard constraints go in permission rules or hooks because instructions are context, not enforcement.

**How do you stop the agent doing something dangerous?**
Deny rules and hooks on destructive commands and sensitive paths, no production credentials in its environment, read-only MCP servers where possible, work on a branch, and approval prompts for pushes and deploys. Instructions in `CLAUDE.md` alone are not a control.

**How do you review agent-generated code?**
Read the diff rather than the summary, run the tests and check they were not weakened, look for scope creep and new dependencies, verify its claims about the codebase, and inspect edge cases the happy path misses. Small tasks with an approved plan are far easier to review than large ones.

**What is the difference between a skill and a `CLAUDE.md` instruction?**
`CLAUDE.md` is always-loaded facts and conventions; a skill is a named procedure with optional scripts whose body loads only when invoked. Skills keep long workflows out of every turn's context and can be restricted to user invocation for side-effecting tasks.

**How do you connect the agent to internal systems?**
Through MCP servers: remote ones with OAuth for SaaS tools, local stdio ones for databases or scripts, configured per project in `.mcp.json` or per user. I prefer read-only modes, keep tool lists small, and gate any write tools behind permission rules.

**Doesn't using an agent mean you stop thinking?**
It means the thinking moves to design, scoping, review and verification. I decide the approach, give it a bounded task, approve the plan, and own the diff; the agent removes typing and searching, not judgement.

**Give an example where the agent was wrong.**
Have a real one ready: for instance it "fixed" a flaky test by broadening a mock so the assertion could not fail, which review caught; the follow-up was a rule in `CLAUDE.md` forbidding changes to test assertions without saying so, and a habit of diffing test files first.

## Key takeaways

- Coding agents read, edit and run code in a loop; their output needs the same review as a colleague's.
- Project instruction files make conventions and commands explicit for every session.
- Plan before editing, work in small test-driven steps, and verify the result yourself.
- Use permissions to keep risky commands behind approval.
- In interviews, describe concrete workflows, review habits and limits, not just tool names.
