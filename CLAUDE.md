# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build
npm run lint     # ESLint (Next.js config)
npx tsc --noEmit # Type-check without emitting
```

There is no test suite — the project relies on TypeScript and ESLint for correctness.

## Environment Variables

Create `.env.local` with:
```
ANTHROPIC_API_KEY=...
GOOGLE_AI_API_KEY=...
OPENAI_API_KEY=...
AI_PROVIDER=anthropic          # or "gemini" or "openai"
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

## Architecture

This is a **Next.js 14 App Router** application — an AI-powered resume builder with Supabase auth and database.

### App Structure

- `app/` — Next.js App Router pages
  - `page.tsx` — Public landing page
  - `dashboard/` — Main authenticated UI; lists saved resumes
  - `resume-editor/` — Client-side resume editor
  - `profile/` — User profile (master experience/education/skills data)
  - `ai-workspace/` — AI task queue for analyze/build modes
  - `cover-letter/` — AI cover letter generation
  - `outreach/` — AI-powered outreach email generation
  - `auth/` — Login/signup/callback pages
  - `admin/` — Admin-only pages (role-gated)
  - `api/` — API routes (see below)
- `components/` — Shared React components
- `lib/` — Utilities and server-side logic
- `store/` — Zustand client state
- `types/` — TypeScript interfaces

### Key API Routes

| Route | Purpose |
|-------|---------|
| `/api/rewrite` | AI bullet point rewriting |
| `/api/resumes` | CRUD for saved resumes |
| `/api/profile` | User profile data |
| `/api/parse-resume` | Parse uploaded PDF/text |
| `/api/ai/build-curated-resume` | AI tailored resume generation |
| `/api/ai/generate-outreach` | AI outreach email generation |
| `/api/ai/outreach-search` | Web search for outreach context |
| `/api/analyze-application` | AI job fit analysis |
| `/api/generate-cover-letter` | AI cover letter generation |
| `/api/ai-tasks` | AI task queue CRUD |
| `/api/rate-limit` | Rate limiting check |

### Authentication & Authorization

- Supabase Auth via `@supabase/ssr`
- `middleware.ts` protects `/dashboard`, `/profile`, `/ai-workspace`, `/outreach` (redirect to `/auth/login`)
- `/admin` routes additionally require `role === "admin"` in the `profiles` table
- Supabase client helpers: `lib/supabase/client.ts` (browser), `lib/supabase/server.ts` (server)

### AI Provider Abstraction

`lib/aiProvider.ts` is a unified wrapper around Anthropic, Gemini, and OpenAI. Always use `createCompletion()` or `complete()` from this module for AI calls rather than instantiating SDK clients directly. The active provider is controlled by the `AI_PROVIDER` env var (defaults to `anthropic`).

### State Management

`store/resumeStore.ts` is the single Zustand store for the resume editor. It holds the current resume JSON and is the source of truth for `ResumeForm` and `ResumePreview`. Data flows: form edits → store → preview rendering / export.

### Resume Data Schema

Core type defined in `types/resume.ts`:
```typescript
{ version, basics: { name, title, location, contact: { email, phone, links[] }, summary },
  experience: [{ company, role, location, start, end, bullets[] }],
  education: [{ institution, degree, graduation }],
  skills: string[],
  projects: [{ name, description, link }] }
```
Dates: `"YYYY-MM"` or `"Present"` for experience; `"YYYY"` for education graduation.

### AI Task Queue

`lib/hooks/useAITaskQueue.ts` + `components/ai-workspace/` implement a persistent async queue backed by Supabase. Tasks have `mode: "analyze" | "build"`, are polled for status, and results are rendered in `TaskQueueSidePanel`.

## Code Conventions

- `'use client'` directive required for any component using hooks or browser APIs
- Import alias `@/*` maps to repo root
- Tailwind CSS only — no CSS modules
- PascalCase for components/types, camelCase for utilities/functions
- Use `unknown` not `any` when the type is genuinely unknown
- No Prettier configured; ESLint enforces code style
