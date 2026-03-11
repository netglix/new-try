# EScope

AI-powered Entry Sheet reviewer for consulting job applicants.  
Paste your ES, choose a target firm (McKinsey, BCG, Bain, Deloitte, Accenture), and get instant scores, detailed feedback, and a rewritten ES in STAR format.

---

## Tech stack

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS v4**
- **OpenAI** (`gpt-4o-mini`) for analysis
- **Supabase** for auth (Magic Link) and history persistence
- **Zod** for validation, **Sonner** for toasts

---

## Local setup

### 1. Clone & install

```bash
git clone https://github.com/netglix/new-try.git
cd new-try
npm install
```

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and fill in:

| Variable | Description |
|---|---|
| `OPENAI_API_KEY` | Your OpenAI API key |
| `SUPABASE_URL` | Your Supabase project URL (server-only) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server-only, **never** expose to browser) |
| `NEXT_PUBLIC_SUPABASE_URL` | Same URL, available in browser |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon/public key for browser client |

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor → New query** and run the contents of [`supabase.sql`](./supabase.sql)
3. Enable **Email (Magic Link)** under **Authentication → Providers**
4. Set your site URL under **Authentication → URL Configuration**

### 4. Run dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Routes

| Route | Description |
|---|---|
| `/` | Landing page |
| `/analyze` | ES input form |
| `/result` | Analysis results (scores, feedback, improved ES) |
| `/history` | User's past analyses (login required) |
| `/api/analyze` | POST endpoint – validates, calls OpenAI, persists |

---

## Vercel deployment

1. Push to GitHub
2. Import the repo at [vercel.com/new](https://vercel.com/new)
3. Add all environment variables from `.env.local` in the Vercel dashboard
4. Deploy – Vercel auto-detects Next.js

---

## Troubleshooting

| Problem | Solution |
|---|---|
| `OPENAI_API_KEY` errors | Make sure the key is set in `.env.local` and you have credits |
| Supabase 401 on history | The Magic Link redirect URL must match your Supabase site URL setting |
| History not saving | Check `SUPABASE_SERVICE_ROLE_KEY` is set; inspect server logs |
| Magic Link not arriving | Check spam folder; verify email provider is enabled in Supabase |
