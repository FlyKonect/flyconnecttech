# Northstack starter kit

Everything Claude Code needs to build the Northstack website, client portal and team panel in VS Code: the project brief, the spec, the data model, the design system, a phased plan with prompts, and a screenshot of every screen.

## What's inside

| Path | What it is |
|---|---|
| `CLAUDE.md` | Project brief. Claude Code reads it automatically at the start of every conversation. |
| `docs/01-product-spec.md` | What every screen does, roles and permissions, statuses, emails |
| `docs/02-data-model.md` | Database entities, fields and enums |
| `docs/03-design-system.md` | Colours, fonts, buttons, components |
| `docs/04-build-plan.md` | 12 phases (0–11), each with a ready-to-paste prompt |
| `docs/05-screens-and-routes.md` | Every screen, its route and its screenshot |
| `design/screens/` | 77 screenshots: 29 for the website, 48 for the portal and team panel |
| `design/source/` | The original design files, for exact copy, sample data and styles |
| `design/sample-data.json` | The sample team, customers, projects, requests and leads, for the seed |
| `design/assets/` | Northstack logo mark (light and on navy) and the route-map hero art |

## How to start

1. **Install the tools:**
   - VS Code (1.94 or later)
   - Git. On Windows also install Git for Windows.
   - Node.js 22 LTS, then run `corepack enable` once to get pnpm.
   - Docker Desktop
   - You also need a paid Claude plan (Pro, Max, Team or Enterprise) or a Claude Console account.
2. **Create the project folder.** Make an empty folder, for example `northstack`, and unzip this kit into it so `CLAUDE.md` sits at the top of the folder.
3. **Open the folder in VS Code.** Use File → Open Folder.
4. **Install Claude Code:**
   - Open Extensions (`Ctrl+Shift+X`, or `Cmd+Shift+X` on Mac), search for **Claude Code** and install it.
   - Open any file, click the Spark icon at the top right of the editor, and sign in.
   - Prefer the terminal? Install the CLI and run `claude` in VS Code's terminal instead.
5. **Check the brief loaded.** Type `/context` and confirm `CLAUDE.md` is listed under memory files.
6. **Start Phase 0.**
   - Type `/plan` (in the terminal, press `Shift+Tab` until plan mode shows).
   - Paste the Phase 0 prompt from `docs/04-build-plan.md`.
   - Read the plan, correct anything, and approve it.
7. **Work phase by phase.** When a phase finishes:
   - Run the app and compare it with the screenshots.
   - Ask Claude to commit.
   - Start a new conversation for the next phase.

## Tips
- **When a screen looks wrong**, drag the screenshot from `design/screens/` into the chat and say what's different.
- **Keep one phase per conversation.** It keeps answers focused, and CLAUDE.md carries the shared context.
- **Development tools:**
  - Emails sent in development appear in Mailpit at http://localhost:8025.
  - The MinIO console (uploaded files) is at http://localhost:9001.
- **Secrets** go in `.env.local` only. Never paste real passwords or API keys into the chat or the docs.
- **Before launch**, fill in the client's placeholders: reply times, WhatsApp number, contact email and the staff email domain (`yourdomain.com`), testimonials, team photos, and the Privacy, Terms and Cookies pages.
