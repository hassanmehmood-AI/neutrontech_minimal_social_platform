# NeutronTech Social Platform — Implementation Plan

---

## Is This Tech Stack the Best / Easiest Approach?

**Short answer: Yes — for your exact goals (Vercel + Supabase), this is the industry standard and the path with the least friction.**

### Why Next.js?
- Built and maintained by Vercel — deploys in one click, zero config.
- Your HTML files already use **Tailwind CSS** — the same Tailwind config
  (colors, fonts, dark mode) moves directly into Next.js with no changes.
- API Routes = backend functions that live in the same project. No separate server.
- File-based routing matches your 5 pages exactly.

### Why Supabase?
- Gives you Auth + PostgreSQL + File Storage in one dashboard.
- No backend server to maintain — your Next.js API routes call Supabase directly.
- Free tier is generous (50k MAU, 500MB DB, 1GB storage).
- Has a JavaScript SDK that works seamlessly with Next.js.

### Why Vercel?
- One GitHub push = live deploy.
- Serverless functions (your API routes) run automatically.
- Free tier covers personal projects.

### Alternative considered and rejected
| Option | Why skipped |
|---|---|
| Vite + React (frontend only) | Would need a separate backend server on a different platform |
| Express.js backend | Extra complexity, extra deployment, extra cost |
| Firebase instead of Supabase | Proprietary, harder to query, no real SQL |
| Remix instead of Next.js | Smaller ecosystem, fewer Supabase examples |

---

## Pages You Have → Pages in Next.js

| Current File | Next.js Route | Description |
|---|---|---|
| `landing.html` | `/` (app/page.tsx) | Public landing / hero page |
| `login.html` | `/login` (app/login/page.tsx) | Login + Sign up |
| `feed.html` | `/feed` (app/feed/page.tsx) | Home feed (protected) |
| `search.html` | `/search` (app/search/page.tsx) | Search users/posts (protected) |
| `profile.html` | `/profile/[id]` (app/profile/[id]/page.tsx) | User profile (protected) |

---

## Final Project Structure (what you are building toward)

```
neutrontech/
├── app/
│   ├── layout.tsx                    ← Root layout (fonts, providers)
│   ├── page.tsx                      ← Landing page
│   ├── login/
│   │   └── page.tsx                  ← Login / Sign up
│   ├── feed/
│   │   └── page.tsx                  ← Home feed
│   ├── search/
│   │   └── page.tsx                  ← Search
│   ├── profile/
│   │   └── [id]/
│   │       └── page.tsx              ← User profile
│   └── api/                          ← Backend (Phase 2)
│       ├── posts/route.ts
│       ├── users/route.ts
│       └── search/route.ts
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Sidebar.tsx
│   ├── feed/
│   │   ├── PostCard.tsx
│   │   └── PostComposer.tsx
│   ├── profile/
│   │   ├── ProfileHeader.tsx
│   │   └── ProfilePosts.tsx
│   └── shared/
│       ├── Avatar.tsx
│       ├── Button.tsx
│       └── SearchBar.tsx
├── lib/
│   └── supabase.ts                   ← Supabase client (Phase 3)
├── middleware.ts                     ← Auth route protection (Phase 3)
├── tailwind.config.ts                ← Your existing color tokens go here
└── .env.local                        ← Supabase keys (Phase 3)
```

---

# PHASE 1 — Frontend (Current Focus)

**Goal:** Reproduce all 5 pages in Next.js using the exact same UI from your HTML files. No backend, no auth. Use static/mock data for now.

---

## Step 1.1 — Initialize Next.js Project

```bash
npx create-next-app@latest neutrontech --typescript --tailwind --eslint --app --src-dir no --import-alias "@/*"
cd neutrontech
```

When prompted:
- TypeScript: **Yes**
- ESLint: **Yes**
- Tailwind CSS: **Yes**
- `src/` directory: **No**
- App Router: **Yes**
- Import alias: **Yes (@/*)**

---

## Step 1.2 — Configure Tailwind (copy your color tokens)

Your HTML files already have a complete Tailwind config with Material Design 3 colors
and dark mode. You will copy those exact color tokens into `tailwind.config.ts`.

Also install the Google Fonts you use (Inter + Geist) via `next/font` — no CDN needed in Next.js.

Material Symbols icons: keep loading from Google Fonts CDN in `app/layout.tsx`.

---

## Step 1.3 — Build Shared Components First

Before building pages, extract the repeating UI pieces into components.
Look at your HTML files and identify what repeats:

- [ ] `Navbar.tsx` — top navigation bar (appears on feed, search, profile)
- [ ] `Avatar.tsx` — user avatar circle (appears everywhere)
- [ ] `Button.tsx` — primary / secondary / ghost button variants
- [ ] `SearchBar.tsx` — search input (appears in navbar and search page)

Build these small components first so your pages just assemble them.

---

## Step 1.4 — Convert Pages One by One

Work in this order (simplest → most complex):

### Page 1: Landing (`app/page.tsx`)
- Convert `landing.html` to JSX
- No data needed — purely static content
- Test on both mobile and desktop widths

### Page 2: Login/Signup (`app/login/page.tsx`)
- Convert `login.html` to JSX
- Use `useState` to toggle between Login and Sign Up form views
- Forms are non-functional yet (wired in Phase 3)

### Page 3: Feed (`app/feed/page.tsx`)
- Convert `feed.html` to JSX
- Create a `MOCK_POSTS` array in the file with 3–5 fake posts
- Render `PostCard` components from the mock array
- `PostComposer` (text box to write a post) is static for now

### Page 4: Search (`app/search/page.tsx`)
- Convert `search.html` to JSX
- Create a `MOCK_USERS` array for search results
- `useState` for the search input field — filter mock data client-side for now

### Page 5: Profile (`app/profile/[id]/page.tsx`)
- Convert `profile.html` to JSX
- Use `MOCK_USER` and `MOCK_POSTS` static data
- The `[id]` in the route is prepared for dynamic data in Phase 2

---

## Step 1.5 — Navigation Between Pages

Wire up all links using Next.js `<Link>` component (replaces `<a href>`).

| From | To | Trigger |
|---|---|---|
| Landing | Login | "Sign in" / "Get started" button |
| Login | Feed | After login (mock: just navigate) |
| Feed | Profile | Click on a user avatar or name |
| Feed | Search | Click the search bar or search icon |
| Any page | Feed | Click the NeutronTech logo / home icon |

---

## Step 1.6 — Responsive Check

Your designs have separate mobile and laptop HTML files.
In Next.js you handle both in one file using Tailwind responsive prefixes:

```
sm:   640px+
md:   768px+
lg:   1024px+
xl:   1280px+
```

For each page, open Chrome DevTools and check:
- [ ] Mobile (375px width)
- [ ] Tablet (768px)
- [ ] Desktop (1280px)

---

## Step 1.7 — Dark Mode

Your HTML files have `darkMode: "class"` in the Tailwind config.
In Next.js, implement a theme toggle:
- Add a `ThemeProvider` context that sets `class="dark"` on the `<html>` element
- Save preference to `localStorage`
- Add a toggle button in the Navbar

---

## Phase 1 Checklist

- [ ] Next.js project initialized
- [ ] Tailwind config with all color tokens copied
- [ ] Fonts configured (Inter + Geist via next/font)
- [ ] Shared components built (Navbar, Avatar, Button, SearchBar)
- [ ] Landing page converted
- [ ] Login/Signup page converted (forms static)
- [ ] Feed page converted (mock data)
- [ ] Search page converted (mock data)
- [ ] Profile page converted (mock data)
- [ ] All navigation links working
- [ ] Responsive on mobile + desktop
- [ ] Dark mode toggle working

---

# PHASE 2 — Backend API Routes

**Goal:** Build the data layer using Next.js API routes. Still use a local/mock database.
Swap in Supabase in Phase 3.

## Routes to build

| Method | Route | What it does |
|---|---|---|
| GET | `/api/posts` | Get all posts for feed |
| POST | `/api/posts` | Create a new post |
| GET | `/api/posts/[id]` | Get a single post |
| DELETE | `/api/posts/[id]` | Delete a post |
| GET | `/api/users/[id]` | Get user profile |
| PATCH | `/api/users/[id]` | Update user profile |
| GET | `/api/search?q=` | Search users and posts |
| POST | `/api/posts/[id]/like` | Like/unlike a post |

---

# PHASE 3 — Supabase Integration

**Goal:** Replace mock data with real Supabase database and add real authentication.

## Step 3.1 — Supabase Project Setup
- Create project at supabase.com
- Run database migrations (schema from the tables listed below)
- Enable Row Level Security on all tables

## Step 3.2 — Database Tables

```sql
-- Users (extends Supabase Auth)
profiles (id, username, full_name, avatar_url, bio, created_at)

-- Content
posts (id, user_id, content, image_url, created_at)
comments (id, post_id, user_id, content, created_at)
likes (id, post_id, user_id, created_at)

-- Social graph
follows (id, follower_id, following_id, created_at)
```

## Step 3.3 — Authentication
- Wire login form to `supabase.auth.signInWithPassword()`
- Wire signup form to `supabase.auth.signUp()`
- Add `middleware.ts` to protect `/feed`, `/search`, `/profile/*`
- Redirect unauthenticated users to `/login`

## Step 3.4 — Connect Frontend to Real Data
- Replace all `MOCK_*` arrays with Supabase queries
- Use Supabase Storage for avatar and post image uploads

---

# PHASE 4 — Deployment to Vercel

**Goal:** Live URL for both frontend and backend.

## Steps
1. Push project to a GitHub repository
2. Go to vercel.com → "Import Project" → select your repo
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy — Vercel auto-builds on every push to main

---

## Summary Timeline

| Phase | What | When to start |
|---|---|---|
| Phase 1 | Frontend — all 5 pages in Next.js | Now |
| Phase 2 | Backend — API routes | After Phase 1 checklist is complete |
| Phase 3 | Supabase — auth + real database | After Phase 2 is complete |
| Phase 4 | Deploy to Vercel | After Phase 3 is complete |

---

*Start with Phase 1, Step 1.1 — initialize the Next.js project.*
